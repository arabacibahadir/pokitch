import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdCatchingPokemon } from "react-icons/md";

const RedirectButton = () => {
  const router = useRouter();
  return (
    <button
      className="text-blue-500 underline"
      onClick={() => {
        router.push("/");
      }}
    >
      here
    </button>
  );
};

export default function Index() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (countdown <= 0) {
        router.push("/");
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <Layout>
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Login successful!</h1>
        {countdown <= 0 ? (
          <p>
            If you are not redirected, please click <RedirectButton />
          </p>
        ) : (
          <p className="flex text-xl">
            <MdCatchingPokemon className="h-6 w-6 animate-spin" /> Redirecting
            to main page in {countdown} seconds
          </p>
        )}
      </div>
    </Layout>
  );
}
