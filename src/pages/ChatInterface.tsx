
import { useParams } from 'react-router-dom';

const ChatInterface = () => {
  const { chatId } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Chat Interface</h1>
      <p>Chat ID: {chatId}</p>
    </div>
  );
};

export default ChatInterface;
