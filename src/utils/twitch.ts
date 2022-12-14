import { TwitchAccessTokenResponse, TwitchUserDetailsResponse } from "@/types";

type Props = {
  authDomain: string;
  apiDomain: string;
  clientId: string;
  clientSecret: string;
  clientCallbackUri: string;
};

class Twitch {
  options: Props;

  constructor(options: Props) {
    this.options = options;
  }

  createAuhotizeUrl = () => {
    const { authDomain, clientId, clientCallbackUri } = this.options;

    const uri = `https://${authDomain}/authorize`;
    const params = {
      client_id: clientId,
      redirect_uri: clientCallbackUri,
      response_type: "code",
      scope: "user:read:email",
    };

    const merge = uri + "?" + new URLSearchParams(params).toString();
    return merge;
  };

  getAccessToken = async (code: string) => {
    console.log("token: fetching with client credentials", this.options);

    const { authDomain, clientId, clientSecret, clientCallbackUri } =
      this.options;

    const uri = `https://${authDomain}/token`;
    const body = {
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: clientCallbackUri,
      grant_type: "authorization_code",
      scope: "user:read:email",
    };
    const res = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body),
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as TwitchAccessTokenResponse;
    console.log("token: fetching response", json);

    return json;
  };

  getUserDetails = async (token: string) => {
    console.log("user: fetching with client credentials", this.options);
    const { apiDomain, clientId } = this.options;

    const uri = `https://${apiDomain}/users`;
    const res = await fetch(uri, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Client-Id": clientId,
      },
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as TwitchUserDetailsResponse;
    console.log("user: fetching response", json);

    return json;
  };
}

export const twitch = new Twitch({
  authDomain: "id.twitch.tv/oauth2",
  apiDomain: "api.twitch.tv/helix",
  clientId: process.env.TWITCH_CLIENT_ID as string,
  clientSecret: process.env.TWITCH_CLIENT_SECRET as string,
  clientCallbackUri: process.env.TWITCH_CLIENT_CALLBACK_URI as string,
});
