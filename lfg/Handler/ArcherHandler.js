import AbstractHandler from './AbstractHandler';

export default class ArcherHandler extends AbstractHandler {

    static phrases = [
        {regex: /loggin/i, reply: 'call Kenny Loggins, \'cuz you\'re in the DANGER ZONE.'},
        {regex: /sitting down/i, reply: 'What?! At the table? Look, he thinks he\'s people!'},
        {regex: /^archer$/i, reply: ["come out and playyyeeeayyyy", "https://www.youtube.com/watch?v=ZHoJf2gXXw8"]},
        {regex: /benoit/i, reply: 'balls'},
        {regex: /erection/i, reply: 'And I love that I have an erection... that doesn\'t involve homeless people.'},
        {regex: /\(╯°□°\）╯︵ ┻━┻/i, reply: '┬─┬﻿ ノ( ゜-゜ノ)'},
        {regex: /lost the game/i, reply: '@Valkyrie217++'}
    ];

    fetchRandomReply() {
        let options = {
            uri:     'http://en.wikiquote.org/wiki/Archer_(TV_series)',
            headers: {
                'User-Agent': 'User-Agent: Archerbot for Hubot (+https://github.com/github/hubot-scripts)'
            }
        };

        return scraper(options, (err, jQuery) => {
            if (err) {
                throw err;
            }

            let quotes = jQuery("dl").toArray(),
                quote  = quotes[Math.floor(Math.random() * quotes.length)],
                dialog = jQuery(quote).text().trim() + "\n";

            return msg.send(dialog);
        });
    }

    getName() {
        return 'archer';
    }

    bind() {
        ArcherHandler.phrases.forEach((phrase) => {
            return this.hear(phrase.regex, (msg) => {
                if (typeof phrase.reply === 'string') {
                    return msg.reply(phrase.reply);
                }

                if (typeof phrase.reply === 'function') {
                    return msg.reply(phrase.reply());
                }

                if (Array.isArray(phrase.reply)) {
                    return phrase.reply.forEach((message) => {
                        return msg.reply(message);
                    })
                }
            });
        });
    }

    getDescription() {
        return 'Archer quoter';
    }

    getHelp() {
        return `archer has no commands.`;
    }
}
