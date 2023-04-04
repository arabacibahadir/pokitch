import { supabase } from "@/utils/supabase";

export default async function twitchCallback(req, res) {
  try {
    const { error, user } = await supabase.auth.signIn(
      {
        access_token: req.body.access_token,
        provider_token: req.body.provider_token,
        expires_in: req.body.expires_in,
        refresh_token: req.body.refresh_token,
        token_type: req.body.token_type,
      },
      {
        getProviderUserProfile: async (provider, { user }) => {
          const { data, error } = await supabase
            .from("profiles")
            .select()
            .eq("id", user.id)
            .single();

          if (error) {
            console.log("Error getting user profile from database:", error);
            return null;
          }

          if (data) {
            return data;
          }

          const response = await fetch("https://api.twitch.tv/helix/users", {
            headers: {
              Authorization: `Bearer ${req.body.access_token}`,
              "Client-Id": process.env.TWITCH_CLIENT_ID,
            },
          });
          const result = await response.json();

          if (result.data.length === 0) {
            console.log("Twitch API returned no user data");
            return null;
          }

          const { id, login, display_name, profile_image_url } = result.data[0];
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .insert({
              id,
              login,
              display_name,
              profile_image_url,
            })
            .single();

          if (profileError) {
            console.log(
              "Error inserting user profile to database:",
              profileError
            );
            return null;
          }
          if (profile) {
            return profile;
          } else {
            console.log("Failed to insert user profile to database");
            return null;
          }
        },
      }
    );

    if (error) {
      console.log("Error signing in user with Twitch:", error);
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in Twitch callback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
