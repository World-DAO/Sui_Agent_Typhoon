import React from 'react';

interface WriteStoryProps {
    newStoryTitle: string;
    newStoryContent: string;
    setNewStoryTitle: (title: string) => void;
    setNewStoryContent: (content: string) => void;
    setIsWritingStory: (isWriting: boolean) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    handleCreateStory: () => void;
  }
  
  export function WriteStory(props: WriteStoryProps) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-3xl">
          <div className="bg-[#1E1B2D] border-4 border-[#4EEAFF] p-6 pixel-corners space-y-4">
            <input
              type="text"
              value={props.newStoryTitle}
              onChange={(e) => props.setNewStoryTitle(e.target.value)}
              placeholder="Write your title here..."
              onKeyDown={props.handleKeyDown}
              className="w-full bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3 
                       text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                       focus:outline-none focus:border-[#4EEAFF]/50"
            />
            <textarea
              value={props.newStoryContent}
              onChange={(e) => props.setNewStoryContent(e.target.value)}
              onKeyDown={props.handleKeyDown}
              placeholder="Write your story here..."
              className="w-full bg-[#2A2A2F] border-2 border-[#4A4A4F] p-3 h-[50vh] 
                       text-[#4EEAFF] placeholder:text-[#4EEAFF]/50 
                       focus:outline-none focus:border-[#4EEAFF]/50 resize-none"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => props.setIsWritingStory(false)}
                className="px-4 py-2 bg-[#2A2A2F] border-2 border-[#4A4A4F]
                         text-[#4EEAFF] hover:bg-[#3A3A3F] transition-colors
                         font-pixel text-sm pixel-corners"
              >
                Cancel
              </button>
              <button
                onClick={props.handleCreateStory}
                disabled={!props.newStoryTitle.trim() || !props.newStoryContent.trim()}
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
    );
  }