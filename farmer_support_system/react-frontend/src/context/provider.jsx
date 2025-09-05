import { ChatProvider } from "./ChatContext";
import { DocumentProvider } from "./DocumentContext";

const Providers = ({ children }) => {
  return (
    <ChatProvider>
      <DocumentProvider>{children}</DocumentProvider>
    </ChatProvider>
  );
};

export default Providers;
