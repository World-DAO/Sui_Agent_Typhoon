"use client"

import * as React from "react"
import { useEffect, useState } from 'react';
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { EventBus } from '@/game/EventBus';
import ColyseusClient, { Story, Reply } from '@/game/utils/ColyseusClient';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/components/config/suiConstant";
import { StoryList } from "./StoryList";
import { StoryPanel } from "./StoryPanel";

export function Mail({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDriftBottle, setIsDriftBottle] = useState<boolean>(false);
  const [replyText, setReplyText] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWritingStory, setIsWritingStory] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isMyStories, setIsMyStories] = useState(false);
  const [replyGroups, setReplyGroups] = useState<{ [key: string]: Reply[] }>({});
  const [recipient, setRecipient] = useState<string>("");

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const [approveAmount, setApproveAmount] = useState(0);

  const [isSending, setIsSending] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string>("");

  const { data: balance } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address || "",
      coinType: `0x2::sui::SUI`
    },
    {
      enabled: !!account?.address,
      refetchInterval: 3000
    }
  );

  const sendCoin = async () => {
    if (!approveAmount || isSending) return;
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [approveAmount*10**9]);

      tx.moveCall({
        arguments: [tx.object(coin), tx.pure.address(recipient)],
        typeArguments: ["0x2::coin::Coin<0x2::sui::SUI>"],
        target: `${PACKAGE_ID}::send::create_transfer`,
      });

      signAndExecute(
        {
          transaction: tx.serialize(),
        },
        {
          onSuccess: async ({ digest }) => {
            const { effects } = await suiClient.waitForTransaction({
              digest: digest,
              options: {
                showEffects: true,  
              },
            })
          },
        },
      );
  }

  const isClaim = async (id: string) => {
    
  }
  const claimCoin = async (id: string) => {
    const tx = new Transaction();
    const obj = tx.object(id);
    // tx.moveCall({
    //   arguments: [obj],
    //   target: `${PACKAGE_ID}::send::claim_transfer`,
    //   typeArguments: ["0x2::coin::Coin<0x2::sui::SUI>"],
    // });
    // signAndExecute({ transaction: tx });
  }

  const fetchStories = async (isMyStoriesView: boolean) => {
    setLoading(true);
    try {
      const fetchedStories = isMyStoriesView 
        ? await ColyseusClient.getMyStories()
        : await ColyseusClient.getAllStories();
      
      console.log(`Fetched ${isMyStoriesView ? 'my' : 'all'} stories:`, fetchedStories);
      setStories(fetchedStories || []);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when modal opens
  useEffect(() => {
    if (isDriftBottle) {
      fetchStories(isMyStories);
    }
  }, [isDriftBottle, isMyStories]);

  // Filter stories based on search
  const filteredStories = React.useMemo(() => {
    if (!searchQuery) return stories;
    const query = searchQuery.toLowerCase();
    return stories.filter((story) => 
      story.title.toLowerCase().includes(query) ||
      story.story_content.toLowerCase().includes(query) ||
      story.author_address.toLowerCase().includes(query)
    );
  }, [searchQuery, stories]);

  useEffect(() => {
    const handleSwitchScene = () => {
      setIsDriftBottle((prev) => !prev);
    }
    EventBus.on('switch-driftbottle-scene', handleSwitchScene);
    return () => {
      EventBus.removeListener('switch-driftbottle-scene');
    };
  }, []);

  const handleClose = () => {
    EventBus.emit('switch-driftbottle-scene');
    EventBus.emit('close-mail');
  };

  const handleSendReply = async () => {
    if (!selectedStory || !replyText.trim()) return;
    try {
        const success = await ColyseusClient.replyToStory(selectedStory.id, replyText);
        if (success) {
            setReplyText('');
            console.log('Reply sent successfully');
            
            // 更新回复列表
            const newReplies = await ColyseusClient.getRepliesForStory(selectedStory.id);
            if (isMyStories) {
                setReplyGroups(newReplies);
            } else {
                const allReplies = Object.values(newReplies).flat();
                const sortedReplies = allReplies.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                setReplies(sortedReplies);
            }
        }
    } catch (error) {
        console.error('Failed to send reply:', error);
    }
  };

  const handleCreateStory = async () => {
    if (!newStoryTitle.trim() || !newStoryContent.trim()) return;
    
    try {
      const success = await ColyseusClient.createStory(newStoryTitle, newStoryContent);
      if (success) {
        setNewStoryTitle('');
        setNewStoryContent('');
        setIsWritingStory(false);
        // Refresh stories list
        const fetchedStories = await ColyseusClient.getAllStories();
        setStories(fetchedStories);
      }
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  const handleStorySelect = async (story: Story) => {
    console.log("Selected story:", story);
    setSelectedStory(story);
    setRecipient(story.author_address);
    
    try {
        const replyData = await ColyseusClient.getRepliesForStory(story.id);
        console.log("Fetched replies:", replyData);
        
        if (isMyStories) {
            setReplyGroups(replyData);
            setReplies([]);
        } else {
            const allReplies = Object.values(replyData).flat();
            const sortedReplies = allReplies.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            setReplies(sortedReplies);
            setReplyGroups({});
        }
    } catch (error) {
        console.error("Failed to fetch replies:", error);
        setReplies([]);
        setReplyGroups({});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === ' ') {
        e.preventDefault();
        const target = e.target as HTMLTextAreaElement | HTMLInputElement;
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        const value = target.value;
        const newValue = value.substring(0, start) + ' ' + value.substring(end);
        
        // For reply text
        if (target.placeholder.includes('reply')) {
            setReplyText(newValue);
        } 
        // For new story content
        else if (target.placeholder.includes('story')) {
            setNewStoryContent(newValue);
        }
        // For story title
        else if (target.placeholder.includes('title')) {
            setNewStoryTitle(newValue);
        }
        
        // Set cursor position after the space
        setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + 1;
        }, 0);
    }
  };

  const handleSendWhiskey = async () => {
    if (!selectedStory) return;
    
    try {
      const success = await ColyseusClient.sendWhiskey(selectedStory.id);
      if (success) {
        console.log('Whiskey sent successfully');
        // Could add some visual feedback here
      } else {
        console.error('Failed to send whiskey');
      }
    } catch (error) {
      console.error('Failed to send whiskey:', error);
    }
  };

  if (!isDriftBottle) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={cn("bg-[#2A2A2F] w-[90%] max-w-6xl h-[90vh] flex flex-col relative border-4 border-[#4A4A4F] shadow-[8px_8px_0px_0px_#1A1A1F]", "pixel-corners", className)}>
        {/* Header */}
        <div className="bg-[#4A4A4F] px-6 py-4 flex items-center justify-between border-b-4 border-[#3A3A3F]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsMyStories(false);
                fetchStories(false);
              }}
              className={cn(
                "text-xl font-pixel text-[#4EEAFF] pixel-text hover:text-[#9D5BDE] transition-colors",
                !isMyStories && "text-[#9D5BDE]"
              )}
            >
              BAR STORIES
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsMyStories(true);
                  fetchStories(true);
                }}
                className={cn(
                  "px-4 py-2 border-b-2 border-r-2 transition-colors text-[#4EEAFF]",
                  isMyStories 
                    ? "bg-[#9D5BDE] border-[#1E1B2D]" 
                    : "bg-[#3A3A3F] border-[#1A1A1F] hover:bg-[#5A5A5F]"
                )}
              >
                My Stories
              </button>
              <button
                onClick={() => setIsWritingStory(true)}
                className="px-4 py-2 bg-[#3A3A3F] border-b-2 border-r-2 border-[#1A1A1F] hover:bg-[#5A5A5F] transition-colors text-[#4EEAFF]"
              >
                Write New Story
              </button>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 bg-[#9D5BDE] border-b-2 border-r-2 border-[#1E1B2D] hover:bg-[#B76EFF] transition-colors">
            <X className="h-4 w-4 text-[#4EEAFF]" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Story List */}
          <StoryList
            stories={stories}
            selectedStory={selectedStory}
            onSelect={setSelectedStory}
            isMyStories={isMyStories}
            setReplies={setReplies}
            setReplyGroups={setReplyGroups}
            setRecipient={setRecipient}
            account={account}
            balance={Number(balance?.totalBalance)/10**9}
            setSearchQuery={setSearchQuery}
          />

          {/* Right panel - Story View/Create */}
          <StoryPanel
        isWritingStory={isWritingStory}
        selectedStory={selectedStory}
        newStoryTitle={newStoryTitle}
        newStoryContent={newStoryContent}
        replyText={replyText}
        replies={replies}
        replyGroups={replyGroups}
        isMyStories={isMyStories}
        recipient={recipient}
        claimStatus={claimStatus}
        approveAmount={approveAmount}
        setNewStoryTitle={setNewStoryTitle}
        setNewStoryContent={setNewStoryContent}
        setReplyText={setReplyText}
        setIsWritingStory={setIsWritingStory}
        setApproveAmount={setApproveAmount}
        handleKeyDown={handleKeyDown}
        handleCreateStory={handleCreateStory}
        handleSendReply={handleSendReply}
        handleSendWhiskey={handleSendWhiskey}
        claimCoin={claimCoin}
      />
        </div>
      </div>
    </div>
  );
} 