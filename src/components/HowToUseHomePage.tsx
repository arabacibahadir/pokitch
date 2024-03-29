import Heading from "@/ui/Heading";
import React from "react";

export default function HowToUseHomePage() {
  return (
    <section id="how-to-use" className="py-12">
      <div className="w-full tablet:mx-auto tablet:max-w-5xl">
        <div className="container">
          <div className="space-y-8">
            <Heading variant="h2">How to use?</Heading>
            <List>
              <ListItem
                title="Step 1: Copy the overlay url"
                description=" Copy the link we gave you after you signed in."
              />
              <ListItem
                title="Step 2: Open your broadcasting tool"
                description="Open your broadcasting tool and add a new browser source. Paste the overlay link into the URL field."
              />
              <ListItem
                title="Step 3: Set up the sizes"
                description="Width: 256, Height: 76. The dimensions should be set to 256x76."
              />
              <ListItem
                title="Step 4: Assign as moderator role"
                description="In order to use the bot properly, you must assign it as a 'mod' role: /mod pokitch_bot"
              />
              <ListItem title="Step 5: And done!" description="" />
            </List>
          </div>
        </div>
      </div>
    </section>
  );
}

const List = ({ children }: { children: React.ReactNode }) => {
  return <ul className="space-y-8">{children}</ul>;
};

const ListItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <li>
      <div>
        <Heading>{title}</Heading>
        <p className="text-gray-400">{description}</p>
      </div>
    </li>
  );
};
