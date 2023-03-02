// create an interface for a post in the mastodon api
export interface Post {
    id: string;
    created_at: string;
    in_reply_to_id: string | null;
    in_reply_to_account_id: string | null;
    sensitive: boolean;
    spoiler_text: string;
    visibility: string;
    uri: string;
    url: string;
    replies_count: number;
    reblogs_count: number;
    favourites_count: number;
    favourited: boolean;
    reblogged: boolean;
    muted: boolean;
    bookmarked: boolean;
    pinned: boolean;
    content: string;
    reblog: Post | null;
    application: {
        name: string;
        website: string | null;
    };
    account: {
        id: string;
        username: string;
        acct: string;
        display_name: string;
        locked: boolean;
        bot: boolean;
        created_at: string;
        note: string;
        url: string;
        avatar: string;
        avatar_static: string;
        header: string;
        header_static: string;
        followers_count: number;
        following_count: number;
        statuses_count: number;
        emojis: any[];
        fields: any[];
    };
    media_attachments: {
        id: string;
        type: string;
        url: string;
        preview_url: string;
        remote_url: string | null;
        text_url: string | null;
        blurhash: string;
        meta: {
            small: {
                width: number;
                height: number;
                size: string;
                aspect: number;
            };
            original: {
                width: number;
                height: number;
                size: string;
                aspect: number;
            };
        };
        description: string | null;
    }[];
    mentions: {
        id: string;
        username: string;
        url: string;
        acct: string;
    }[];
    tags: {
        name: string;
        url: string;
    }[];
    emojis: {
        shortcode: string;
        static_url: string;
        url: string;
        visible_in_picker: boolean;
    }[];
    card: {
        url: string;
        title: string;
        description: string;
        type: string;
        author_name: string;
        author_url: string;
        provider_name: string;
        provider_url: string;
        html: string;
        width: number;
        height: number;
        image: string;
    } | null;
    poll: {
        id: string;
        expires_at: string;
        expired: boolean;
        multiple: boolean;
        votes_count: number;
        options: {
            title: string;
            votes_count: number;
        }[];
    } | null;
    reply_to: Post;
}
