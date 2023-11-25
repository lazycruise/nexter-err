import dynamic from "next/dynamic";

const Chat = dynamic(() => import("../components/Chat"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <main>
        <div className="bg-blue-500 p-4 text-white text-center">
          <h1 className="text-3xl font-semibold">Nexter, your NextJS Guider</h1>
        </div>
      </main>
      <Chat />
      <footer>
        <div className="text-center text-gray-100 mt-4">
          Powered by{" "}
          <a
            href="https://ably.com"
            target="_blank"
            rel="noopener noreferrer"
            classNameName="underline"
          >
            Ably
          </a>{" "}
          and{" "}
          <a
            href="https://klu.ai"
            target="_blank"
            rel="noopener noreferrer"
            classNameName="underline"
          >
            Klu.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
