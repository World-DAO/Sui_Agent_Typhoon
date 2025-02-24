import * as React from "react"
import { useState } from "react"
import { StoryListItem } from '@/components/StoryListItem';
import { Story, Reply } from '@/game/utils/ColyseusClient';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StoryListProps {
  stories: Story[];
  selectedStory: Story | null;
  setSearchQuery: (query: string) => void;
  onSelect: (story: Story) => void;
  isMyStories: boolean;
  setReplies: (replies: Reply[]) => void;
  setReplyGroups: (groups: { [key: string]: Reply[] }) => void;
  setRecipient: (address: string) => void;
  account: { address: string } | null;
  balance?: number;
}

export function StoryList({ 
  stories, 
  selectedStory, 
  onSelect,
  isMyStories,
  setReplies,
  setReplyGroups,
  setRecipient,
  account, 
  balance 
}: StoryListProps) {
  console.log("StoryList stories:", stories);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = React.useMemo(() => {
    if (!searchQuery) return stories;
    const query = searchQuery.toLowerCase();
    return stories.filter((story) => 
      story.title.toLowerCase().includes(query) ||
      story.story_content.toLowerCase().includes(query) ||
      story.author_address.toLowerCase().includes(query)
    );
  }, [searchQuery, stories]);

  return (
    <div className="w-[400px] border-r-4 border-[#4EEAFF] bg-[#2A4C54]">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#4EEAFF]/70" />
                <input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A1A1F] border-2 border-[#4A4A4F] px-9 py-2 
                             text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                             focus:outline-none focus:border-[#4EEAFF]/50"
                />
                <p className="w-18 text-[#4EEAFF] mt-2">
                  {account?.address ? `${account.address.slice(0,4)}...${account.address.slice(-4)}` : 'Not Connected'}&nbsp;&nbsp;&nbsp;
                  barcoin(SUI):{balance}
                </p>

              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="px-4 space-y-2">
          {filteredStories.map((story) => (
            <StoryListItem
              key={story.id}
              story={story}
              isSelected={selectedStory?.id === story.id}
              onSelect={onSelect}
              isMyStories={isMyStories}
              setReplies={setReplies}
              setReplyGroups={setReplyGroups}
              setRecipient={setRecipient}
            />
          ))}
        </div>
            </ScrollArea>
          </div>
  );
} 