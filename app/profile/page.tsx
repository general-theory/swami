'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../components/ui/use-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  favTeamId: string | null;
  favoriteTeam?: {
    id: string;
    name: string;
    logo: string;
  };
}

interface Team {
  id: string;
  name: string;
  logo: string;
}

export default function ProfilePage() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickName: '',
    favTeamId: ''
  });
  const [originalData, setOriginalData] = useState({
    firstName: '',
    lastName: '',
    nickName: '',
    favTeamId: ''
  });

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          const data = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            nickName: userData.nickName || '',
            favTeamId: userData.favTeamId || ''
          };
          setFormData(data);
          setOriginalData(data);
        }

        // Fetch teams
        const teamsResponse = await fetch('/api/admin/teams');
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setOriginalData(formData);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickName">Display Name</Label>
              <Input
                id="nickName"
                value={formData.nickName}
                onChange={(e) => handleChange('nickName', e.target.value)}
                placeholder="Enter your display name"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favTeamId">Favorite Team</Label>
              <Select
                value={formData.favTeamId || undefined}
                onValueChange={(value) => handleChange('favTeamId', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your favorite team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              {!isEditing ? (
                <Button type="button" onClick={handleEdit}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 