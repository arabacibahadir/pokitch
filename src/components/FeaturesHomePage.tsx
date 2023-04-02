import Heading from "@/ui/Heading";
import { cx } from "class-variance-authority";
import {
  BsArchiveFill,
  BsBoxArrowRight,
  BsEmojiSmileFill,
  BsGift,
  BsShieldShaded,
  BsStarFill,
} from "react-icons/bs";

const ListItem = ({
  icon,
  colorClass,
  title,
  description,
}: {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="space-y-4">
      <div
        className={cx(
          "inline-flex h-12 w-12 items-center justify-center rounded-md",
          colorClass
        )}
      >
        {icon}
      </div>
      <div>
        <Heading variant="h4">{title}</Heading>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default function FeaturesHomePage() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
          <ListItem
            icon={<BsEmojiSmileFill />}
            colorClass="bg-indigo-900/50 text-indigo-300"
            title="Easy to use"
            description="It is easy to add your stream and enjoy interacting with your chat audience."
          />
          <ListItem
            icon={<BsStarFill />}
            colorClass="bg-yellow-900/50 text-yellow-300"
            title="Commands"
            description="!poke welcomepack - Random poke for beginner players, !poke attack - You can hit once every 30 seconds in chat, !poke inventory - You can see your poke collection"
          />

          <ListItem
            icon={<BsShieldShaded />}
            colorClass="bg-green-900/50 text-green-300"
            title="No permission required"
            description="You don't need to give us any of your information to use the bot."
          />
          <ListItem
            icon={<BsArchiveFill />}
            colorClass="bg-teal-900/50 text-teal-300"
            title="Collection"
            description="It is possible to view your poke collection."
          />
          <ListItem
            icon={<BsBoxArrowRight />}
            colorClass="bg-blue-900/50 text-blue-300"
            title="Trade"
            description="Trade your poke with someone else."
          />
          <ListItem
            icon={<BsGift />}
            colorClass="bg-red-900/50 text-red-300"
            title="Gift"
            description="Gift your poke whoever you want."
          />
        </div>
      </div>
    </section>
  );
}
