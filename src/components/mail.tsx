"use client"

import * as React from "react"
import { useEffect, useState } from 'react';
import { Search, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EventBus } from '@/game/EventBus';
import ColyseusClient, { Story } from '@/game/utils/ColyseusClient';

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

  // Fetch stories when modal opens
  useEffect(() => {
    const fetchStories = async () => {
      if (!isDriftBottle) return;
      setLoading(true);
      try {
        const fetchedStories = await ColyseusClient.getAllStories();
        setStories(fetchedStories);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [isDriftBottle]);

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

  if (!isDriftBottle) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={cn("bg-[#2A2A2F] w-[90%] max-w-6xl h-[90vh] flex flex-col relative border-4 border-[#4A4A4F] shadow-[8px_8px_0px_0px_#1A1A1F]", "pixel-corners", className)}>
        {/* Header */}
        <div className="bg-[#4A4A4F] px-6 py-4 flex items-center justify-between border-b-4 border-[#3A3A3F]">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-pixel text-[#4EEAFF] pixel-text">TAVERN STORIES</h1>
            <button
              onClick={() => setIsWritingStory(true)}
              className="px-4 py-2 bg-[#3A3A3F] border-b-2 border-r-2 border-[#1A1A1F] hover:bg-[#5A5A5F] transition-colors text-[#4EEAFF]"
            >
              Write New Story
            </button>
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
                  className="w-full bg-[#1A1A1F] border-2 border-[#4A4A4F] px-9 py-2 text-sm text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 focus:outline-none focus:border-[#4EEAFF]/50"
                />
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
                    onClick={() => setSelectedStory(story)}
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
                               focus:outline-none focus:border-[#4EEAFF]/50
                               font-pixel text-sm pixel-corners"
                    />
                    <textarea
                      value={newStoryContent}
                      onChange={(e) => setNewStoryContent(e.target.value)}
                      placeholder="Write your story here..."
                      className="w-full bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3 h-[50vh] 
                               text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                               focus:outline-none focus:border-[#4EEAFF]/50
                               font-pixel text-sm resize-none pixel-corners"
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
              <>
                <ScrollArea className="flex-1">
                  <div className="p-8">
                    <div className="mx-auto max-w-3xl">
                      <div className="bg-[#1E1B2D] border-4 border-[#4EEAFF] p-6 pixel-corners">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[#4EEAFF]">{selectedStory.title}</h3>
                          <span className="text-sm text-[#4EEAFF]/50">
                            {new Date(selectedStory.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-[#4EEAFF]/70 mt-2">
                          From: {selectedStory.author_address.slice(0, 6)}...{selectedStory.author_address.slice(-4)}
                        </div>
                        <div className="mt-4 text-[#4EEAFF]/90 whitespace-pre-wrap">
                          {selectedStory.story_content}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t-4 border-[#4EEAFF] bg-[#1E1B2D]">
                  <div className="mx-auto max-w-3xl">
                    <div className="flex gap-4">
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="flex-1 bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3 h-24 
                                 text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                                 focus:outline-none focus:border-[#4EEAFF]/50
                                 font-pixel text-sm resize-none pixel-corners"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-[#2A2A2F] border-b-2 border-r-2 
                                 border-[#1E1B2D] hover:bg-[#9D5BDE] transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 pixel-corners"
                      >
                        <Send className="h-5 w-5 text-[#4EEAFF]" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
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