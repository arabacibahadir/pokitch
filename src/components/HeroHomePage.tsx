import GuestHeroHomePage from "@/components/GuestHeroHomePage";
import Heading from "@/components/ui/Heading";
import UserHeroHomePage from "@/components/UserHeroHomePage";

type Props = {
  user: object;
};

export default function HeroHomePage({ user }: Props) {
  return (
    <section className="py-24">
      <div className="w-full tablet:mx-auto tablet:max-w-5xl">
        <div className="container">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Heading variant="h1">
                Tempore unde optio sequi, dolore velit error dolorum officiis
                ducimus assumenda.
              </Heading>
              <p className="w-full text-gray-300 tablet:mx-auto tablet:max-w-lg">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Recusandae omnis, hic error minus ipsam veniam totam maiores
                eveniet sunt..
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
