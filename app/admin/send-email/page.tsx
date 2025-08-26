'use client';
import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';


interface League {
  id: number;
  name: string;
}

interface User {
  clerkId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Participation {
  userId: number;
  leagueId: number;
  user: User;
  league: League;
}

export default function SendEmailPage() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<'everyone' | 'league' | 'specific'>('everyone');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch leagues and participations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaguesRes, participationsRes] = await Promise.all([
          fetch('/api/admin/leagues'),
          fetch('/api/admin/participations')
        ]);
        
        if (leaguesRes.ok) {
          const leaguesData = await leaguesRes.json();
          setLeagues(leaguesData);
        }
        
        if (participationsRes.ok) {
          const participationsData = await participationsRes.json();
          setParticipations(participationsData);
        }
      } catch {
        console.error('Error fetching data');
      }
    };

    fetchData();
  }, []);

  // Get users based on current selection
  const getSelectedUsers = () => {
    if (recipients === 'everyone') {
      return participations.map(p => p.user);
    } else if (recipients === 'league' && selectedLeagueId) {
      return participations
        .filter(p => p.leagueId === parseInt(selectedLeagueId))
        .map(p => p.user);
    } else if (recipients === 'specific') {
      return participations
        .filter(p => selectedUserIds.includes(p.user.clerkId))
        .map(p => p.user);
    }
    return [];
  };

  const selectedUsers = getSelectedUsers();

  // Rich text editor functions
  const formatText = (command: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';

    switch (command) {
      case 'bold':
        replacement = `<strong>${selectedText || 'Bold Text'}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selectedText || 'Italic Text'}</em>`;
        break;
      case 'underline':
        replacement = `<u>${selectedText || 'Underlined Text'}</u>`;
        break;
      case 'h1':
        replacement = `<h1>${selectedText || 'Heading 1'}</h1>`;
        break;
      case 'h2':
        replacement = `<h2>${selectedText || 'Heading 2'}</h2>`;
        break;
      case 'p':
        replacement = `<p>${selectedText || 'Paragraph text'}</p>`;
        break;
      case 'br':
        replacement = '<br>';
        break;
    }

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setBody(newValue);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Subject and body are required',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: 'No Recipients',
        description: 'Please select at least one recipient',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        recipients,
        leagueId: recipients === 'league' ? parseInt(selectedLeagueId) : undefined,
        userIds: recipients === 'specific' ? selectedUserIds : undefined,
        subject: subject.trim(),
        body: body.trim(),
      };

      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: result.message,
        });
        
        // Reset form
        setSubject('');
        setBody('');
        setSelectedUserIds([]);
        setSelectedLeagueId('');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to send emails',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: 'Error',
        description: 'Failed to send emails',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Send Email</h1>
        <p className="text-gray-600">Send emails to users with customizable content and formatting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Email Composition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>Choose who to send this email to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="everyone"
                    name="recipients"
                    value="everyone"
                    checked={recipients === 'everyone'}
                    onChange={(e) => setRecipients(e.target.value as 'everyone' | 'league' | 'specific')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="everyone">Everyone (all users in active season)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="league"
                    name="recipients"
                    value="league"
                    checked={recipients === 'league'}
                    onChange={(e) => setRecipients(e.target.value as 'everyone' | 'league' | 'specific')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="league">Specific League</Label>
                </div>
                
                {recipients === 'league' && (
                  <Select value={selectedLeagueId} onValueChange={setSelectedLeagueId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map((league) => (
                        <SelectItem key={league.id} value={league.id.toString()}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="specific"
                    name="recipients"
                    value="specific"
                    checked={recipients === 'specific'}
                    onChange={(e) => setRecipients(e.target.value as 'everyone' | 'league' | 'specific')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="specific">Specific Users</Label>
                </div>
              </div>

              {recipients === 'specific' && (
                <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                  {participations.map((participation) => (
                    <div key={participation.user.clerkId} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={participation.user.clerkId}
                        checked={selectedUserIds.includes(participation.user.clerkId)}
                        onChange={() => toggleUserSelection(participation.user.clerkId)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={participation.user.clerkId} className="text-sm">
                        {participation.user.firstName} {participation.user.lastName} ({participation.user.email}) - {participation.league.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

                      <div className="pt-2">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
            {selectedUsers.length} recipient{selectedUsers.length !== 1 ? 's' : ''} selected
          </span>
        </div>
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>Compose your email with subject and body</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Body</Label>
                <div className="mt-1 border rounded-md">
                  {/* Formatting Toolbar */}
                  <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('bold')}
                      className="h-8 px-2"
                    >
                      <strong>B</strong>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('italic')}
                      className="h-8 px-2"
                    >
                      <em>I</em>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('underline')}
                      className="h-8 px-2"
                    >
                      <u>U</u>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('h1')}
                      className="h-8 px-2"
                    >
                      H1
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('h2')}
                      className="h-8 px-2"
                    >
                      H2
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('p')}
                      className="h-8 px-2"
                    >
                      P
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('br')}
                      className="h-8 px-2"
                    >
                      BR
                    </Button>
                  </div>
                  
                  <textarea
                    id="email-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter email body content. Use the formatting buttons above for rich text."
                    className="w-full h-64 p-3 resize-none focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Hide Preview' : 'Show Preview'}
                </Button>
                
                <Button
                  onClick={handleSendEmail}
                  disabled={isLoading || selectedUsers.length === 0}
                  className="flex-1"
                >
                  {isLoading ? 'Sending...' : `Send Email${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview and Recipients */}
        <div className="space-y-6">
          {/* Recipients Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recipients Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div key={user.clerkId} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-gray-600">{user.email}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Preview */}
          {previewMode && (
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-white">
                  <div className="font-semibold text-lg mb-2">{subject || 'Subject'}</div>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: body || 'Email body will appear here...' }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 