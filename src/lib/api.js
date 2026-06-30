import { supabase } from './supabase';

export const authApi = {
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    const { data: userRecord } = await supabase
      .from('profiles')
      .select('email')
      .ilike('email', email);

    if (!userRecord || userRecord.length === 0) {
      throw new Error('There is no user record corresponding to this identifier.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) throw new Error('The password is invalid.');
      if (error.message.includes('invalid format')) throw new Error('The email address is badly formatted.');
      throw error;
    }
    return data;
  },

  async signup(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });
    if (error) {
      if (error.message.includes('already registered')) throw new Error('Email already in use.');
      if (error.message.includes('invalid format')) throw new Error('The email address is badly formatted.');
      throw error;
    }
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const courseApi = {
  async fetchAvailableCourses(programFilter = '') {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .ilike('program', `%${programFilter}%`)
      .order('requests', { ascending: false });
    if (error) throw error;
    return data;
  },

  async fetchActiveDemands() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .gt('requests', 0)
      .order('requests', { ascending: false });
    if (error) throw error;
    return data;
  }
};

export const requestApi = {
  async joinPetition(profileId, courseId, preferredSchedule) {
    const { data, error } = await supabase
      .from('requests')
      .insert([{ profile_id: profileId, course_id: courseId, preferred_schedule: preferredSchedule }]);
    if (error) {
      if (error.code === '23505') throw new Error('You have already submitted a request for this course.');
      throw error;
    }
    return data;
  },

  async fetchStudentRequests(userId) {
    const { data, error } = await supabase
      .from('requests')
      .select(`id, preferred_schedule, courses (id, course_code, description, semester, requests)`)
      .eq('profile_id', userId);
    if (error) throw error;
    return data;
  },

  async fetchCourseDetails(courseId) {
    const { data, error } = await supabase
      .from('requests')
      .select(`preferred_schedule, profiles (full_name, email, program)`)
      .eq('course_id', courseId);
    if (error) throw error;
    return data;
  }
};