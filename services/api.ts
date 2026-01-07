import { supabase } from './supabase';
import { User, Standup, Task, UserRole, Deadline } from '../types';

// --- Auth & User ---

export const apiAuth = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name,
          full_name: name // Add full_name as redundant field for trigger compatibility
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching profile:', error);
    }

    if (profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar ? profile.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`,
        role: profile.role as UserRole,
        isAdmin: profile.is_admin,
      };
    } else {
        // Attempt to self-heal: Create missing profile for existing auth user
        // This handles cases where public tables were wiped but auth users remain
        await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
            avatar: user.user_metadata.avatar || '',
            role: 'Developer'
        });

        // Fallback if profile doesn't exist yet (should generally exist after trigger)
         return {
            id: user.id,
            name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'U')}`,
            role: UserRole.DEVELOPER,
            isAdmin: false,
         }
    }
  },
  
  async updateProfile(userId: string, updates: Partial<User>) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.avatar) dbUpdates.avatar = updates.avatar;
      if (updates.role) dbUpdates.role = updates.role;
      // email is handled by auth, isAdmin usually restricted

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);
        
      if (error) throw error;
  }
};

// --- Users ---

export const apiUsers = {
    async getAll(): Promise<User[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        
        if (error) throw error;
        
        return (data || []).map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            avatar: p.avatar ? p.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`,
            role: p.role as UserRole,
            isAdmin: p.is_admin
        }));
    }
}


// --- Standups ---

export const apiStandups = {
  async getAll(): Promise<Standup[]> {
    const { data, error } = await supabase
      .from('standups')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      date: s.date,
      yesterday: s.yesterday,
      today: s.today,
      blockers: s.blockers,
      mood: s.mood,
      jiraLinks: s.jira_links || [],
      views: s.views || [],
      createdAt: s.created_at,
    }));
  },

  async create(standup: Omit<Standup, 'id'>) {
    const { data, error } = await supabase
      .from('standups')
      .insert({
        user_id: standup.userId,
        date: standup.date,
        yesterday: standup.yesterday,
        today: standup.today,
        blockers: standup.blockers,
        mood: standup.mood,
        jira_links: standup.jiraLinks,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...standup, id: data.id, createdAt: data.created_at };
  },

  async update(id: string, updates: Partial<Standup>) {
    const dbUpdates: any = {};
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.yesterday) dbUpdates.yesterday = updates.yesterday;
    if (updates.today) dbUpdates.today = updates.today;
    if (updates.blockers) dbUpdates.blockers = updates.blockers;
    if (updates.mood) dbUpdates.mood = updates.mood;
    if (updates.jiraLinks !== undefined) dbUpdates.jira_links = updates.jiraLinks;

    const { error } = await supabase
      .from('standups')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('standups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async markViewed(id: string, userId: string) {
    const { data: current } = await supabase.from('standups').select('views').eq('id', id).single();
    const currentViews: string[] = current?.views || [];
    
    if (!currentViews.includes(userId)) {
      const { error } = await supabase
        .from('standups')
        .update({ views: [...currentViews, userId] })
        .eq('id', id);
      if (error) throw error;
    }
  },
};

// --- Deadlines ---

export const apiDeadlines = {
  async getAll(): Promise<Deadline[]> {
    const { data, error } = await supabase
      .from('deadlines')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      title: d.title,
      dueDate: d.due_date,
      description: d.description,
      releaseLink: d.release_link,
      creatorId: d.creator_id,
    }));
  },

  async create(deadline: Omit<Deadline, 'id'>) {
    const { data, error } = await supabase
      .from('deadlines')
      .insert({
        title: deadline.title,
        due_date: deadline.dueDate,
        description: deadline.description,
        release_link: deadline.releaseLink,
        creator_id: deadline.creatorId,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      dueDate: data.due_date,
      description: data.description,
      releaseLink: data.release_link,
      creatorId: data.creator_id,
    };
  },

  async update(id: string, updates: Partial<Deadline>) {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.releaseLink !== undefined) dbUpdates.release_link = updates.releaseLink;

    const { error } = await supabase
      .from('deadlines')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
