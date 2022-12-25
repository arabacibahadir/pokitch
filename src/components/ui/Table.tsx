export const Table = ({ ...props }: React.ComponentProps<"table">) => {
  return <table className="w-full text-left" {...props} />;
};

export const Thead = ({ ...props }: React.ComponentProps<"thead">) => {
  return <thead className="bg-neutral-900/50 text-xs uppercase" {...props} />;
};

export const Th = ({ ...props }: React.ComponentProps<"th">) => {
  return <th scope="col" className="py-3 px-6" {...props} />;
};

export const Tr = ({ ...props }: React.ComponentProps<"tr">) => {
  return (
    <tr
      className="border-b border-neutral-900/50 bg-neutral-900/50"
      {...props}
    />
  );
};

export const Td = ({ ...props }: React.ComponentProps<"th">) => {
  return <td className="py-4 px-6" {...props} />;
};
