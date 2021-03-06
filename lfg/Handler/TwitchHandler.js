import AbstractSubscriberHandler from './AbstractSubscriberHandler';
import MainStore from '../Store/MainStore';
import IntervalStore from '../Store/IntervalStore';
import DiscordHelper from '../Helper/DiscordHelper';

import {Response} from 'hubot';
import {autobind} from 'core-decorators';

export default class TwitchHandler extends AbstractSubscriberHandler {
    live = this.store.get('twitch.live', []);

    runAtStart = false;

    bind() {
        super.bind();

        this.command('online', (res) => {
            let room = res.message.room;

            if (res.match[2] === undefined) {
                let msg   = "The following users are currently streaming: \n```\n",
                    count = 0;

                console.log(this.live);

                this.live.forEach((info) => {
                    if (info.room === room) {
                        count++;
                        msg += `${info.subscriber}: http://www.twitch.tv/${info.subscriber}\n`;
                    }
                });

                if (count === 0) {
                    return res.send("There are no streamers online.")
                }

                msg += "```\n";

                return res.send(msg);
            }

            let subscriber = res.match[2];
            this.run(room, subscriber, true);
        })
    }

    @autobind
    checkResponse(room, subscriber, err, res, body, replyIfOffline) {
        let json = JSON.parse(body);

        if (json.stream === null || json.stream === undefined) {
            if (this.isLive(room, subscriber) !== false) {
                this.live.splice(this.isLive(room, subscriber));
                this.store.set('twitch.live', this.live);

                return res.send(`${subscriber} has gone offline :(`);
            }

            if (replyIfOffline) {
                res.send(`${subscriber} is offline`);
            }

            return;
        }

        if (!replyIfOffline && this.isLive(room, subscriber) !== false) {
            return;
        }

        if (!replyIfOffline) {
            this.setLive(room, subscriber);
        }

        let stream = json.stream,
            name = this.buildNameFromStream(stream),
            game = stream.channel.game;

        return res.send(`${subscriber} is streaming${game !== null ? ' ' + game : ''}!\n${name}`);
    }

    isLive(room, subscriber) {
        for (let index in this.live) {
            if (!this.live.hasOwnProperty(index)) {
                continue;
            }

            let info = this.live[index];
            if (info.room === room && info.subscriber === subscriber) {
                return index;
            }
        }

        return false;
    }

    buildNameFromStream(stream) {
        return "*" + stream.channel.status + "*: " + stream.channel.url + "\n" + stream.preview.large;
    }

    getName() {
        return 'twitch';
    }

    getDescription() {
        return 'Twitch Subscription';
    }

    getHelp() {
        return `Commands:
    lfg twitch subscribe|sub \<subscriber> - Returns a subscriber post immediately and every hour thereafter
    lfg twitch unsubscribe|unsub \<subscriber> - Stops the bot from returning any more stories from subscriber
    lfg twitch list - lists all queued subscribers
    lfg twitch clear|wipe - clear all queued subscribers
    lfg twitch online - List all online subscribers for the current room
        `;
    }

    setLive(room, subscriber) {
        this.live.push({room: room, subscriber: subscriber});

        this.store.set('twitch.live', this.live);
    }

    @autobind
    wipe(res) {
        super.wipe(res);

        this.live = [];
        this.store.set('twitch.live', this.live);
    }


    getInterval() {
        return 30;
    }

    getUrl(subscriber) {
        return "https://api.twitch.tv/kraken/streams/" + subscriber;
    }

    setHeaders(http) {
        http
            .header('Accept', 'application/vnd.twitchtv.v3+json')
            .header('Client-ID', process.env.HUBOT_LFG_TWITCH_CLIENT_ID);
    }
}
