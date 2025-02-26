import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Story, Reply } from '@/game/utils/ColyseusClient';

interface StoryViewProps {
  selectedStory: Story;
  replies: Reply[];
  replyGroups: Record<string, Reply[]>;
  isMyStories: boolean;
  recipient: string;
  claimStatus: string;
  replyText: string;
  approveAmount: number;
  setReplyText: (text: string) => void;
  setApproveAmount: (amount: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  handleSendReply: () => void;
  handleSendWhiskey: () => void;
  claimCoin: (amount: string) => void;
}

export function StoryView({
  selectedStory,
  replies,
  replyGroups,
  isMyStories,
  recipient,
  claimStatus,
  replyText,
  approveAmount,
  setReplyText,
  setApproveAmount,
  handleKeyDown,
  handleSendReply,
  handleSendWhiskey,
  claimCoin,
}: StoryViewProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Original Story section */}
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
                                    <span className="text-lg">🍷</span>
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
                                                  onClick={() => claimCoin("3")}
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
  );
}