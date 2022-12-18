import GuestHeroHomePage from "@/components/GuestHeroHomePage";
import Heading from "@/components/ui/Heading";
import UserHeroHomePage from "@/components/UserHeroHomePage";

type Props = {
  user: object;
};

export default function HeroHomePage({ user }: Props) {
  return (
    <section className="pt-24">
      <div className="w-full tablet:mx-auto tablet:max-w-5xl">
        <div className="container">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Heading variant="h1">
                Pokitch is an interactive Twitch chat game that streamers can
                add as an overlay to their live streams.
              </Heading>
              <p className="w-full text-gray-300 tablet:mx-auto tablet:max-w-lg">
                Pokitch offers a way for viewers to{" "}
                <span className="font-bold">interact</span> with the streamer
                and other viewers in <span className="font-bold">realtime</span>{" "}
                and is made to be fun and interactive.
              </p>
            </div>

            <div>
              {user ? <UserHeroHomePage data={user} /> : <GuestHeroHomePage />}
            </div>

            <div>
              <figure>
                <video
                  className="rounded-lg border-black bg-black shadow-xl"
                  poster=""
                  width="100%"
                  height="auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="" type="video/mp4" />
                </video>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
