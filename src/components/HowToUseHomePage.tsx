import Heading from "@/components/ui/Heading";
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
                title="Step 3: Set up the sizes "
                description="Width: 285, Height: 76. The dimensions should be set to 285x76 to avoid problems."
              />
              <ListItem title="Step 4: And done!" description="" />
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
