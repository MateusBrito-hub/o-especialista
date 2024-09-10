const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const Report = require('../models/report.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reportar')
        .setDescription('Reportar um erro e sua correção')
        .addStringOption(option =>
            option.setName('codigo_cliente')
                .setDescription('Código + Nome do Cliente')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('detalhe_correcao')
                .setDescription('Detalhes da correção realizada')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('detalhe_erro')
                .setDescription('Detalhes do erro')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('imagem_erro')
                .setDescription('Imagem mostrando o erro')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('imagem_correcao')
                .setDescription('Imagem mostrando a correção')
                .setRequired(true)),

    async execute(interaction) {
        const cliente = interaction.options.getString('codigo_cliente');
        const detalheErro = interaction.options.getString('detalhe_erro');
        const detalheCorrecao = interaction.options.getString('detalhe_correcao');
        const imagemErro = interaction.options.getAttachment('imagem_erro');
        const imagemCorrecao = interaction.options.getAttachment('imagem_correcao');

        const reportData = {
            client: cliente, 
            imageErro: imagemErro.url,
            descriptionErro: detalheErro,
            solutionImage: imagemCorrecao.url,
            descriptionSolution:detalheCorrecao,


        }
        const newReport = new Report(reportData)
        await newReport.save()

        const errorEmbed = {
            color: 0xff0000,
            title: `Relatório do Cliente: ${cliente}`,
            fields: [
                { name: 'Cliente', value: cliente },
                { name: 'Detalhes do Erro', value: detalheErro },
            ],
            image: {
                url: imagemErro.url,
            },
            footer: {
                text: 'Page 1/2',
            },
        };

        const solutionEmbed = {
            color: 0x00ff00,
            title: `Relatório do Cliente: ${cliente}`,
            fields: [
                { name: 'Cliente', value: cliente },
                { name: 'Detalhes da Correção', value: detalheCorrecao },
            ],
            image: {
                url: imagemCorrecao.url,
            },
            footer: {
                text: 'Page 2/2',
            },
        };

        const pages = [errorEmbed, solutionEmbed];
        let currentPage = 0;
        const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Página Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0);
        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Próxima Página')
            .setStyle(ButtonStyle.Primary);
        const buttonRow = new ActionRowBuilder()
            .addComponents(previousButton, nextButton);
        interaction.reply({ embeds: [pages[currentPage]], components: [buttonRow] })
            .then((message) => {
                const collector = message.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id });
                collector.on('collect', (buttonInteraction) => {
                    if (buttonInteraction.customId === 'previous') {
                        currentPage--;
                        if (currentPage < 0) currentPage = pages.length - 1;
                    } else if (buttonInteraction.customId === 'next') {
                        currentPage++;
                        if (currentPage >= pages.length) currentPage = 0;
                    }
                    previousButton.setDisabled(currentPage === 0); // Atualiza o estado de desabilitado do botão "Página Anterior"
                    nextButton.setDisabled(currentPage === pages.length - 1); // Atualiza o estado de desabilitado do botão "Próxima Página"
                    buttonInteraction.update({ embeds: [pages[currentPage]], components: [buttonRow] });
                });
                collector.on('end', () => {
                    buttonRow.components.forEach(component => component.setDisabled(true));
                    message.edit({ components: [buttonRow] });
                });
            });
    },
};