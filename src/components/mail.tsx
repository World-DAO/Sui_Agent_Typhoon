"use client"

import * as React from "react"
import { useEffect, useState } from 'react';
import { Search, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EventBus } from '@/game/EventBus';
import ColyseusClient, { Story, Reply } from '@/game/utils/ColyseusClient';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/components/config/suiConstant";

// Mock data for bar stories (stories received from others)
const MOCK_BAR_STORIES: Story[] = [
  {
    id: 1,
    author_address: "0x1234567890abcdef",
    title: "A Night at the Tavern",
    story_content: "Last night at the tavern was magical. The bard's songs echoed through the halls, and adventurers from all corners shared their tales...",
    created_at: new Date("2024-03-10T20:00:00Z")
  },
  {
    id: 2,
    author_address: "0xabcdef1234567890",
    title: "The Mysterious Merchant",
    story_content: "A peculiar merchant visited today, carrying items that seemed to glow with an otherworldly light...",
    created_at: new Date("2024-03-11T15:30:00Z")
  }
];

// Mock data for my stories (stories written by the user)
const MOCK_MY_STORIES: Story[] = [
  {
    id: 3,
    author_address: "0xYourWalletAddress", // This should match the user's wallet
    title: "My First Adventure",
    story_content: "Today I embarked on my first quest in this magical realm. The tavern keeper gave me a mysterious map...",
    created_at: new Date("2024-03-12T10:00:00Z")
  },
  {
    id: 4,
    author_address: "0xYourWalletAddress",
    title: "Strange Encounters",
    story_content: "Met a group of wandering minstrels who spoke of ancient treasures hidden beneath the tavern...",
    created_at: new Date("2024-03-13T14:20:00Z")
  }
];

const MOCK_REPLIES: Reply[] = [
  {
    id: 1,
    story_id: 1,
    parent_reply_id: 0,
    author_address: "0xdef1234567890abc",
    reply_content: "I was there too! The bard's performance was unforgettable.",
    created_at: new Date("2024-03-10T21:00:00Z")
  },
  {
    id: 2,
    story_id: 1,
    parent_reply_id: 1,
    author_address: "0x7890abcdef123456",
    reply_content: "Did anyone catch the name of that song about the dragon?",
    created_at: new Date("2024-03-10T22:15:00Z")
  }
];

// Add ReplyGroup interface
interface ReplyGroup {
    address: string;
    replies: Reply[];
}

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
  const [approveAmount, setApproveAmount] = useState(0)

  const [isSending, setIsSending] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string>("");

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
          transaction: tx,
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

  const claimCoin = async (id: string) => {
    const tx = new Transaction();
    const obj = tx.object(id);
    tx.moveCall({
      arguments: [obj],
      target: `${PACKAGE_ID}::send::claim_transfer`,
      typeArguments: ["0x2::coin::Coin<0x2::sui::SUI>"],
    });
    signAndExecute({ transaction: tx });
  }


  const fetchStories = async (isMyStoriesView: boolean) => {
    setLoading(true);
    try {
      const fetchedStories = isMyStoriesView 
        ? await ColyseusClient.getMyStories()
        : await ColyseusClient.getAllStories();
      
      console.log(`Fetched ${isMyStoriesView ? 'my' : 'all'} stories:`, fetchedStories);
      
      // Only use mock data if no stories returned
      if (fetchedStories && fetchedStories.length > 0) {
        setStories(fetchedStories);
      } else {
        // Fallback to mock data only if no real data
        setStories(isMyStoriesView ? MOCK_MY_STORIES : MOCK_BAR_STORIES);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      setStories(isMyStoriesView ? MOCK_MY_STORIES : MOCK_BAR_STORIES);
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
    await sendCoin()
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + ' ' + value.substring(end);
      
      // For reply text
      if (target.placeholder.includes('reply')) {
        setReplyText(newValue);
      } 
      // For new story
      else if (target.placeholder.includes('story')) {
        setNewStoryContent(newValue);
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
                <p className="w-18 text-[#4EEAFF] mt-2">0x666&nbsp;&nbsp;&nbsp; barcoin:38</p>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-16rem)]">


              <div className="px-4 space-y-2">
                {filteredStories.map((story) => (
                  <div
                    key={story.id}
                    className={cn(
                      "cursor-pointer space-y-2 p-3 border-2",
                      "transition-colors pixel-corners",
                      selectedStory?.id === story.id 
                        ? "bg-[#3A3A3F] border-[#4EEAFF]" 
                        : "bg-[#2A2A2F] border-[#4A4A4F] hover:border-[#4EEAFF]/50"
                    )}
                    onClick={() => handleStorySelect(story)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-none text-[#4EEAFF]">
                          {story.author_address.slice(0, 6)}...{story.author_address.slice(-4)}
                        </h4>
                        <p className="text-sm text-[#4EEAFF]/70">{story.title}</p>
                      </div>
                      <div className="text-xs text-[#4EEAFF]/50">
                        {new Date(story.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-[#4EEAFF]/70 line-clamp-2">
                      {story.story_content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right panel - Story View/Create */}
          <div className="flex-1 flex flex-col bg-[#2A4C54]">
            {isWritingStory ? (
              <div className="p-8">
                <div className="mx-auto max-w-3xl">
                  <div className="bg-[#1E1B2D] border-4 border-[#4EEAFF] p-6 pixel-corners space-y-4">
                    <input
                      type="text"
                      value={newStoryTitle}
                      onChange={(e) => setNewStoryTitle(e.target.value)}
                      placeholder="Story Title..."
                      className="w-full bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3 
                               text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                               focus:outline-none focus:border-[#4EEAFF]/50"
                    />
                    <textarea
                      value={newStoryContent}
                      onChange={(e) => setNewStoryContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Write your story here..."
                      className="w-full bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3 h-[50vh] 
                               text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                               focus:outline-none focus:border-[#4EEAFF]/50 resize-none"
                    />
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setIsWritingStory(false)}
                        className="px-4 py-2 bg-[#2A2A2F] border-2 border-[#4A4A4F]
                                 text-[#4EEAFF] hover:bg-[#3A3A3F] transition-colors
                                 font-pixel text-sm pixel-corners"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateStory}
                        disabled={!newStoryTitle.trim() || !newStoryContent.trim()}
                        className="px-4 py-2 bg-[#2A2A2F] border-2 border-[#4EEAFF]
                                 text-[#4EEAFF] hover:bg-[#9D5BDE] transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 font-pixel text-sm pixel-corners"
                      >
                        Publish Story
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedStory ? (
              <ScrollArea className="flex-1">
                <div className="p-8">
                  <div className="mx-auto max-w-3xl space-y-6">
                    {/* Original Story */}
                    <div className="bg-[#1E1B2D] border-4 border-[#4EEAFF] pixel-corners">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1" className="border-0">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                              <h3 className="font-semibold text-[#4EEAFF]">{selectedStory.title}</h3>
                              <span className="text-sm text-[#4EEAFF]/50">
                                {new Date(selectedStory.created_at).toLocaleString()}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-6 pb-4">
                              <div className="text-sm text-[#4EEAFF]/70">
                                From: {selectedStory.author_address.slice(0, 6)}...{selectedStory.author_address.slice(-4)}
                              </div>
                              <div className="mt-4 text-[#4EEAFF]/90 whitespace-pre-wrap">
                                {selectedStory.story_content}
                              </div>
                              {/* Add Action Buttons */}
                              <div className="flex justify-end gap-2 mt-4">
                                {/* 代币操作区域 */}

                                {/* 简化后的 Claim 按钮 */}
                                

                                {/* 原有的 Like 按钮保持不变 */}
                                <button
                                    onClick={handleSendWhiskey}
                                    className="px-3 py-1 bg-[#722F37] border-2 border-[#4EEAFF] 
                                            text-[#4EEAFF] hover:bg-[#9D5BDE] transition-colors
                                            font-pixel text-sm pixel-corners flex items-center gap-1"
                                >
                                    <span className="text-lg">🥃</span>
                                    Like
                                </button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Conversation Thread */}
                    {isMyStories ? (
                        <div className="space-y-4">
                            {Object.entries(replyGroups).map(([addressPair, replies]) => (
                                <div key={addressPair} className="bg-[#1E1B2D] border-4 border-[#4EEAFF] pixel-corners">
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="item-1" className="border-0">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center justify-between w-full">
                                                    <h3 className="font-semibold text-[#4EEAFF]">
                                                        Conversation with: {addressPair.split('-')[1].slice(0, 6)}...{addressPair.split('-')[1].slice(-4)}
                                                    </h3>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="px-6 pb-4 space-y-4">
                                                    {replies.map((reply) => (
                                                        <div key={reply.id} className="bg-[#2A2A2F] p-4 rounded">
                                                            <div className="text-sm text-[#4EEAFF]/70">
                                                                {new Date(reply.created_at).toLocaleString()}
                                                            </div>
                                                            <div className="mt-2 text-[#4EEAFF]/90 whitespace-pre-wrap">
                                                                {reply.reply_content}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* Reply input for this conversation */}
                                                    <div className="mt-4">
                                                        <textarea 
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder="Reply to this conversation..."
                                                            className="w-full bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3
                                                                     text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                                                                     focus:outline-none focus:border-[#4EEAFF]/50 resize-none"
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <button
                                                                onClick={handleSendReply}
                                                                className="px-3 py-1 bg-[#722F37] border-2 border-[#4EEAFF]
                                                                         text-[#4EEAFF] hover:bg-[#9D5BDE] transition-colors
                                                                         font-pixel text-sm pixel-corners"
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {replies.map((reply) => (
                                <div key={reply.id} className="bg-[#1E1B2D] border-4 border-[#4EEAFF] pixel-corners">
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="item-1" className="border-0">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center justify-between w-full">
                                                    <h3 className="font-semibold text-[#4EEAFF]">
                                                        {reply.author_address === selectedStory.author_address ? "Author's Reply" : "Reply"}
                                                    </h3>
                                                    <span className="text-sm text-[#4EEAFF]/50">
                                                        {new Date(reply.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="px-6 pb-4">
                                                    <div className="text-sm text-[#4EEAFF]/70">
                                                        From: {reply.author_address.slice(0, 6)}...{reply.author_address.slice(-4)}
                                                    </div>
                                                    <div className="mt-4 text-[#4EEAFF]/90 whitespace-pre-wrap">
                                                        {reply.reply_content}
                                                    </div>
                                                </div>
                                                <button
                                                  onClick={() => claimCoin(0)} // 根据实际合约调整参数
                                                  className="px-3 py-1 bg-[#FFD700] border-2 border-[#B8860B] 
                                                          text-[#8B4513] hover:bg-[#FFC125] transition-colors
                                                          font-pixel text-sm pixel-corners flex items-center gap-1 ml-6"
                                              >
                                                  <div className="w-4 h-4 relative">
                                                      <div className="absolute inset-0 rounded-full bg-[#FFD700] border-2 border-[#B8860B]" />
                                                      <div className="absolute inset-[25%] text-[8px] font-bold text-[#B8860B]">$</div>
                                                  </div>
                                                  Claim
                                              </button>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply Box - Only show for Bar Stories */}
                    {!isMyStories && (
                        <div className="bg-[#1E1B2D] border-4 border-[#4EEAFF] pixel-corners">
                            <Accordion type="single" collapsible defaultValue="reply">
                                <AccordionItem value="reply" className="border-0">
                                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                        <div className="flex items-center justify-between w-full">
                                            <h3 className="font-semibold text-[#4EEAFF]">Write Reply</h3>
                                            <span className="text-sm text-[#4EEAFF]/50">
                                                {new Date().toLocaleString()}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="px-6 pb-4">
                                            <textarea 
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Write your reply here..."
                                                className="w-full bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3 h-[50vh] 
                                                        text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                                                        focus:outline-none focus:border-[#4EEAFF]/50 resize-none mt-4"
                                            />
                                            <div className="flex justify-end mt-4">
                                              <div className="flex items-center gap-2 mr-4">
                                                <p className="w-10 text-[#4EEAFF]">coin</p>
                                                  <input
                                                      type="number"
                                                      value={approveAmount}
                                                      onChange={(e) => setApproveAmount(Number(e.target.value))}
                                                      className="w-24 bg-[#2A2A2F] border-2 border-[#4A4A4F] px-2 py-1
                                                              text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                                                              focus:outline-none focus:border-[#4EEAFF]/50"
                                                      placeholder="Amount"
                                                      min="0"
                                                  />
                                              </div>
                                                <button
                                                    onClick={() => handleSendReply()}
                                                    disabled={!replyText.trim()}
                                                    className="px-4 py-2 bg-[#2A2A2F] border-2 border-[#4EEAFF]
                                                            text-[#4EEAFF] hover:bg-[#9D5BDE] transition-colors
                                                            disabled:opacity-50 disabled:cursor-not-allowed
                                                            font-pixel text-sm pixel-corners"
                                                >
                                                    Send Reply
                                                </button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}

                    {/* 在 UI 中显示接收者信息 */}
                    {selectedStory && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-[#4EEAFF]">
                                To: {recipient.slice(0, 6)}...{recipient.slice(-4)}
                            </h3>
                        </div>
                    )}

                    {/* 在 UI 中添加状态提示 */}
                    {claimStatus && (
                        <div className="text-sm text-[#4EEAFF]">
                            {claimStatus}
                        </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[#4EEAFF]/50 font-pixel">Select a story to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 