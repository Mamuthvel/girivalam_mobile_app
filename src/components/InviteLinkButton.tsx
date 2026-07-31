import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface InviteLinkButtonProps {
  groupId: string;
  groupCode: string;
  groupName: string;
  groupType: 'public' | 'private';
  password?: string;
}

const InviteLinkButton = ({ 
  groupId, 
  groupCode, 
  groupName, 
  groupType,
  password 
}: InviteLinkButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const generateInviteLink = (): string => {
    const baseUrl = window.location.origin;
    let link = `${baseUrl}/join?groupId=${groupId}&code=${groupCode}`;
    if (groupType === 'private' && password) {
      link += `&pwd=${encodeURIComponent(password)}`;
    }
    return link;
  };

  const handleCopyLink = async () => {
    const link = generateInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link Copied! 📋",
        description: "Share this link with your group members",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = () => {
    const link = generateInviteLink();
    const text = `🙏 Join my Girivalam group "${groupName}"!\n\nClick to join: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    const link = generateInviteLink();
    const shareText = `🙏 Join my Girivalam group "${groupName}"!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} - Girivalam`,
          text: shareText,
          url: link,
        });
      } catch (err) {
        // User cancelled sharing - fall back to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90"
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg">
          <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer gap-3 py-3">
            <Share2 className="h-4 w-4" />
            <span>Share Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer gap-3 py-3">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer gap-3 py-3">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span>Share via WhatsApp</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default InviteLinkButton;
