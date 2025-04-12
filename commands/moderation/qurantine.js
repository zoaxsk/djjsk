const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const QuarantineConfig = require('../../models/qurantine/quarantineConfig');
const UserQuarantine = require('../../models/qurantine/userQuarantine');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quarantine')
        .setDescription('Manage quarantine system.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Put a user in quarantine.')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('User to quarantine')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for quarantine')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Release a user from quarantine.')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('User to release')
                        .setRequired(true))
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(target.id);
        const guildId = interaction.guild.id;


        const userId = interaction.user.id;
        const guild = interaction.guild;

        const config = await QuarantineConfig.findOne({ guildId });
        if (!config || !config.quarantineEnabled) {
            return interaction.editReply({ content: '🚨 Quarantine system is not enabled.' });
        }


        if (subcommand === 'add') {
            const reason = interaction.options.getString('reason') || 'No reason provided';
            const quarantineRole = interaction.guild.roles.cache.get(config.quarantineRoleId);
            if (!quarantineRole) return interaction.editReply({ content: '🚨 Quarantine role not found.' });

            // Store user's previous roles
            const userRoles = member.roles.cache.map(role => role.id);
            await member.roles.set([quarantineRole]);

            // Save to database
            await UserQuarantine.findOneAndUpdate(
                { userId: target.id, guildId },
                { isQuarantined: true, quarantinedAt: new Date(), reason },
                { upsert: true }
            );

            config.userRoles.set(target.id, userRoles);
            await config.save();

            // Send DM to user
            const dmEmbed = new EmbedBuilder()
                .setTitle('🚨 You Have Been Quarantined')
                .setDescription(`You have been placed in quarantine in **${interaction.guild.name}**.`)
                .addFields({ name: 'Reason', value: reason })
                .setColor('#ff0000')
                .setTimestamp();

            try {
                await member.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log(`❌ Failed to send DM to ${target.tag}. They might have DMs disabled.`);
            }

            interaction.editReply({ content: `🚨 **${target.tag}** has been quarantined for: **${reason}**` });
        } 
        
        else if (subcommand === 'remove') {
            const userQuarantine = await UserQuarantine.findOne({ userId: target.id, guildId });

            if (!userQuarantine || !userQuarantine.isQuarantined) {
                return interaction.editReply({ content: '🚨 This user was not quarantined by the system.' });
            }

            // ✅ Update user status in database BEFORE removing roles
            await UserQuarantine.findOneAndUpdate(
                { userId: target.id, guildId },
                { isQuarantined: false }
            );

            // Retrieve stored role IDs
            const previousRoleIds = config.userRoles.get(target.id) || [];
            const validRoles = previousRoleIds
                .map(roleId => interaction.guild.roles.cache.get(roleId))
                .filter(role => role);

            // ✅ Remove Quarantine Role BEFORE Restoring Roles
            const quarantineRole = interaction.guild.roles.cache.get(config.quarantineRoleId);
            if (quarantineRole) {
                await member.roles.remove(quarantineRole);
            }

            if (validRoles.length > 0) {
                await member.roles.set(validRoles);
            }

            // ✅ Remove from stored role data
            config.userRoles.delete(target.id);
            await config.save();

            // Send DM to user
            const dmEmbed = new EmbedBuilder()
                .setTitle('✅ You Have Been Released')
                .setDescription(`You have been released from quarantine in **${interaction.guild.name}**.`)
                .setColor('#ff00ff')
                .setTimestamp();

            try {
                await member.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log(`❌ Failed to send DM to ${target.tag}. They might have DMs disabled.`);
            }

    
            interaction.editReply({ content: `✅ **${target.tag}** has been released from quarantine and previous roles restored.` });
        }
    }
};
