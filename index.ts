import { addMessagePreEditListener, addMessagePreSendListener, MessageObject, removeMessagePreEditListener, removeMessagePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

interface Replacement {
    setting: keyof typeof settings.store;
    domains: string[];
    target: string;
}

const REPLACEMENTS: Replacement[] = [
    { setting: "twitter", domains: ["x.com"], target: "fixupx.com" },
    { setting: "twitter", domains: ["twitter.com"], target: "fxtwitter.com" },
    { setting: "bluesky", domains: ["bsky.app"], target: "fxbsky.app" },
    { setting: "tiktok", domains: ["tiktok.com"], target: "tnktok.com" },
    { setting: "instagram", domains: ["instagram.com"], target: "kkinstagram.com" },
    { setting: "reddit", domains: ["reddit.com"], target: "rxddit.com" },
    { setting: "pixiv", domains: ["pixiv.net"], target: "phixiv.net" },
    { setting: "furaffinity", domains: ["furaffinity.net"], target: "fxfuraffinity.net" },
    { setting: "twitch", domains: ["twitch.tv", "twitch.com"], target: "fxtwitch.seria.moe" },
    { setting: "tumblr", domains: ["tumblr.com"], target: "tpmblr.com" },
    { setting: "deviantart", domains: ["deviantart.com"], target: "fixdeviantart.com" },
    { setting: "threads", domains: ["threads.net", "threads.com"], target: "vxthreads.net" },
    { setting: "spotify", domains: ["spotify.com"], target: "fxspotify.com" },
    { setting: "facebook", domains: ["facebook.com"], target: "facebed.com" },
];

const settings = definePluginSettings({
    twitter: { type: OptionType.BOOLEAN, description: "Fix X / Twitter embeds (x.com, twitter.com)", default: true },
    bluesky: { type: OptionType.BOOLEAN, description: "Fix Bluesky embeds (bsky.app)", default: true },
    tiktok: { type: OptionType.BOOLEAN, description: "Fix TikTok embeds (tiktok.com)", default: true },
    instagram: { type: OptionType.BOOLEAN, description: "Fix Instagram embeds (instagram.com)", default: true },
    reddit: { type: OptionType.BOOLEAN, description: "Fix Reddit embeds (reddit.com)", default: true },
    pixiv: { type: OptionType.BOOLEAN, description: "Fix Pixiv embeds (pixiv.net)", default: true },
    furaffinity: { type: OptionType.BOOLEAN, description: "Fix Fur Affinity embeds (furaffinity.net)", default: true },
    twitch: { type: OptionType.BOOLEAN, description: "Fix Twitch embeds (twitch.tv, twitch.com)", default: true },
    tumblr: { type: OptionType.BOOLEAN, description: "Fix Tumblr embeds (tumblr.com)", default: true },
    deviantart: { type: OptionType.BOOLEAN, description: "Fix DeviantArt embeds (deviantart.com)", default: true },
    threads: { type: OptionType.BOOLEAN, description: "Fix Threads embeds (threads.net, threads.com)", default: true },
    spotify: { type: OptionType.BOOLEAN, description: "Fix Spotify embeds (spotify.com)", default: true },
    facebook: { type: OptionType.BOOLEAN, description: "Fix Facebook embeds (facebook.com)", default: true },
});

function matchReplacement(host: string): Replacement | null {
    return REPLACEMENTS.find(r =>
        settings.store[r.setting] &&
        r.domains.some(d => host === d || host.endsWith("." + d))
    ) ?? null;
}

function fixUrl(urlString: string): string {
    try {
        const url = new URL(urlString);
        const replacement = matchReplacement(url.hostname);
        if (!replacement) return urlString;

        url.hostname = replacement.target;
        return url.toString();
    } catch {
        return urlString;
    }
}

function fixContent(content: string): string {
    return content.replace(/https?:\/\/[^\s<>()]+/g, fixUrl);
}

function onSend(_channelId: string, msg: MessageObject) {
    if (msg.content) msg.content = fixContent(msg.content);
}

function onEdit(_channelId: string, _messageId: string, msg: MessageObject) {
    if (msg.content) msg.content = fixContent(msg.content);
}

export default definePlugin({
    name: "FixEmbeds",
    description: "Replaces social media URLs to embed-friendly ones before your messages are sent.",
    authors: [{ name: "yeongaori", id: 602447697047191562n }],
    settings,

    start() {
        addMessagePreSendListener(onSend);
        addMessagePreEditListener(onEdit);
    },

    stop() {
        removeMessagePreSendListener(onSend);
        removeMessagePreEditListener(onEdit);
    },
});
