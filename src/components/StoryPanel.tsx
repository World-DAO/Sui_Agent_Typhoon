import { WriteStory } from "@/components/WriteStory";
import { StoryView } from "@/components/StoryView";
import { Story, Reply } from '@/game/utils/ColyseusClient';

interface StoryPanelProps {
    isWritingStory: boolean;
    selectedStory: Story | null;
    newStoryTitle: string;
    newStoryContent: string;
    replyText: string;
    replies: Reply[];
    replyGroups: Record<string, Reply[]>;
    isMyStories: boolean;
    recipient: string;
    claimStatus: string;
    approveAmount: number;
    setNewStoryTitle: (title: string) => void;
    setNewStoryContent: (content: string) => void;
    setReplyText: (text: string) => void;
    setIsWritingStory: (isWriting: boolean) => void;
    setApproveAmount: (amount: number) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    handleCreateStory: () => void;
    handleSendReply: () => void;
    handleSendWhiskey: () => void;
    claimCoin: (amount: string) => void;
  }

export function StoryPanel(props: StoryPanelProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#2A4C54]">
      {props.isWritingStory ? (
        <WriteStory
          newStoryTitle={props.newStoryTitle}
          newStoryContent={props.newStoryContent}
          setNewStoryTitle={props.setNewStoryTitle}
          setNewStoryContent={props.setNewStoryContent}
          setIsWritingStory={props.setIsWritingStory}
          handleKeyDown={props.handleKeyDown}
          handleCreateStory={props.handleCreateStory}
        />
      ) : props.selectedStory ? (
        <StoryView
          selectedStory={props.selectedStory}
          replies={props.replies}
          replyGroups={props.replyGroups}
          isMyStories={props.isMyStories}
          recipient={props.recipient}
          claimStatus={props.claimStatus}
          replyText={props.replyText}
          approveAmount={props.approveAmount}
          setReplyText={props.setReplyText}
          setApproveAmount={props.setApproveAmount}
          handleKeyDown={props.handleKeyDown}
          handleSendReply={props.handleSendReply}
          handleSendWhiskey={props.handleSendWhiskey}
          claimCoin={props.claimCoin}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-[#4EEAFF]/50 font-pixel">Select a story to read</p>
        </div>
      )}
    </div>
  );
}
