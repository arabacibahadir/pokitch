import GuestHeroHomePage from "@/components/GuestHeroHomePage";
import Heading from "@/components/ui/Heading";
import UserHeroHomePage from "@/components/UserHeroHomePage";

export default function HeroHomePage({ user }: { user: any }) {
  return (
    <section className="flex flex-col items-center justify-center py-24">
      <div className="w-full max-w-5xl">
        <div className="space-y-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Heading variant="h1">
              Tempore unde optio sequi, dolore velit error dolorum officiis
              ducimus assumenda.
            </Heading>
            <p className="w-full max-w-lg text-gray-300">
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
    </section>
  );
}
