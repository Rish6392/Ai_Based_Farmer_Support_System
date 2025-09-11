import { AuthProvider } from "./AuthContext";
import { ChatProvider } from "./ChatContext";
import { DocumentProvider } from "./DocumentContext";

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <ChatProvider>
        <DocumentProvider>{children}</DocumentProvider>
      </ChatProvider>
    </AuthProvider>
  );
};

export default Providers;
