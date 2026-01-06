import { supabase } from './supabase';
import { User, Standup, Task, UserRole } from '../types';

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
      return null;
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
      })
      .select()
      .single();

    if (error) throw error;
    return { ...standup, id: data.id };
  },

  async update(id: string, updates: Partial<Standup>) {
    const dbUpdates: any = {};
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.yesterday) dbUpdates.yesterday = updates.yesterday;
    if (updates.today) dbUpdates.today = updates.today;
    if (updates.blockers) dbUpdates.blockers = updates.blockers;
    if (updates.mood) dbUpdates.mood = updates.mood;

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
};

// --- Tasks ---

export const apiTasks = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;

    return (data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      assigneeId: t.assignee_id,
      creatorId: t.creator_id,
      dueDate: t.due_date,
      type: t.type || 'task', // Map snake_case to camelCase if needed, though 'type' is same. Handle default.
    }));
  },

  async create(task: Omit<Task, 'id'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        assignee_id: task.assigneeId,
        creator_id: task.creatorId,
        due_date: task.dueDate,
        type: task.type || 'task',
      })
      .select()
      .single();

    if (error) throw error;
    return { ...task, id: data.id };
  },

  async update(id: string, updates: Partial<Task>) {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.assigneeId) dbUpdates.assignee_id = updates.assigneeId;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.type) dbUpdates.type = updates.type;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
