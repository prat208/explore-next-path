export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          audience: string[]
          author_id: string | null
          canonical_url: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          level: Database["public"]["Enums"]["difficulty"]
          published_at: string | null
          reading_minutes: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          sources: Json
          status: Database["public"]["Enums"]["content_status"]
          subtitle: string | null
          tags: string[]
          title: string
          topic_id: string | null
          updated_at: string
          view_count: number
          why_it_matters: string | null
        }
        Insert: {
          audience?: string[]
          author_id?: string | null
          canonical_url?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          level?: Database["public"]["Enums"]["difficulty"]
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          tags?: string[]
          title: string
          topic_id?: string | null
          updated_at?: string
          view_count?: number
          why_it_matters?: string | null
        }
        Update: {
          audience?: string[]
          author_id?: string | null
          canonical_url?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          level?: Database["public"]["Enums"]["difficulty"]
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          tags?: string[]
          title?: string
          topic_id?: string | null
          updated_at?: string
          view_count?: number
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          id: string
          name: string
          role_title: string | null
          slug: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          id?: string
          name: string
          role_title?: string | null
          slug: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          id?: string
          name?: string
          role_title?: string | null
          slug?: string
        }
        Relationships: []
      }
      careers: {
        Row: {
          created_at: string
          id: string
          interview_prep: string[]
          overview: string | null
          portfolio_expectations: string[]
          progression: Json
          related_roles: string[]
          role_summary: string | null
          slug: string
          soft_skills: string[]
          status: Database["public"]["Enums"]["content_status"]
          technical_skills: string[]
          title: string
          tools_used: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          interview_prep?: string[]
          overview?: string | null
          portfolio_expectations?: string[]
          progression?: Json
          related_roles?: string[]
          role_summary?: string | null
          slug: string
          soft_skills?: string[]
          status?: Database["public"]["Enums"]["content_status"]
          technical_skills?: string[]
          title: string
          tools_used?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interview_prep?: string[]
          overview?: string | null
          portfolio_expectations?: string[]
          progression?: Json
          related_roles?: string[]
          role_summary?: string | null
          slug?: string
          soft_skills?: string[]
          status?: Database["public"]["Enums"]["content_status"]
          technical_skills?: string[]
          title?: string
          tools_used?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          bonus: string[]
          created_at: string
          deadline: string | null
          id: string
          judging: string[]
          number: number | null
          project_id: string | null
          requirements: string[]
          slug: string
          statement: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          bonus?: string[]
          created_at?: string
          deadline?: string | null
          id?: string
          judging?: string[]
          number?: number | null
          project_id?: string | null
          requirements?: string[]
          slug: string
          statement?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          bonus?: string[]
          created_at?: string
          deadline?: string | null
          id?: string
          judging?: string[]
          number?: number | null
          project_id?: string | null
          requirements?: string[]
          slug?: string
          statement?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          collection_id: string
          id: string
          item_id: string
          item_type: string
          position: number
        }
        Insert: {
          collection_id: string
          id?: string
          item_id: string
          item_type: string
          position?: number
        }
        Update: {
          collection_id?: string
          id?: string
          item_id?: string
          item_type?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          created_at: string
          data: Json
          id: string
          owner_id: string
          owner_type: string
          position: number
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          owner_id: string
          owner_type: string
          position?: number
          type: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          owner_id?: string
          owner_type?: string
          position?: number
          type?: string
        }
        Relationships: []
      }
      content_relationships: {
        Row: {
          from_id: string
          from_type: string
          id: string
          relation: string
          sort: number
          to_id: string
          to_type: string
        }
        Insert: {
          from_id: string
          from_type: string
          id?: string
          relation?: string
          sort?: number
          to_id: string
          to_type: string
        }
        Update: {
          from_id?: string
          from_type?: string
          id?: string
          relation?: string
          sort?: number
          to_id?: string
          to_type?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          audience: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          estimated_hours: number | null
          id: string
          milestones: string[]
          next_steps: string[]
          prerequisites: string[]
          skills: string[]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          id?: string
          milestones?: string[]
          next_steps?: string[]
          prerequisites?: string[]
          skills?: string[]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          id?: string
          milestones?: string[]
          next_steps?: string[]
          prerequisites?: string[]
          skills?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          estimated_minutes: number
          id: string
          module_label: string | null
          path_id: string
          position: number
          slug: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number
          id?: string
          module_label?: string | null
          path_id: string
          position?: number
          slug: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number
          id?: string
          module_label?: string | null
          path_id?: string
          position?: number
          slug?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt: string | null
          caption: string | null
          created_at: string
          id: string
          kind: string
          metadata: Json
          url: string
        }
        Insert: {
          alt?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          url: string
        }
        Update: {
          alt?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          url?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          category: string
          cost: string
          country: string | null
          created_at: string
          deadline: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          eligibility: string | null
          id: string
          location: string | null
          official_url: string | null
          organization: string | null
          slug: string
          source: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          verified_at: string | null
          work_mode: string
        }
        Insert: {
          category?: string
          cost?: string
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          eligibility?: string | null
          id?: string
          location?: string | null
          official_url?: string | null
          organization?: string | null
          slug: string
          source?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          verified_at?: string | null
          work_mode?: string
        }
        Update: {
          category?: string
          cost?: string
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          eligibility?: string | null
          id?: string
          location?: string | null
          official_url?: string | null
          organization?: string | null
          slug?: string
          source?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          verified_at?: string | null
          work_mode?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          career_interests: string[]
          country: string | null
          created_at: string
          display_name: string | null
          experience_level: Database["public"]["Enums"]["difficulty"]
          goals: string[]
          id: string
          intents: string[]
          interests: string[]
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          career_interests?: string[]
          country?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: Database["public"]["Enums"]["difficulty"]
          goals?: string[]
          id: string
          intents?: string[]
          interests?: string[]
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          career_interests?: string[]
          country?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: Database["public"]["Enums"]["difficulty"]
          goals?: string[]
          id?: string
          intents?: string[]
          interests?: string[]
          onboarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          architecture: string | null
          cover_image_url: string | null
          created_at: string
          demo_url: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          estimated_hours: number | null
          extensions: string[]
          id: string
          outcome: string | null
          portfolio_advice: string | null
          prerequisites: string[]
          problem: string | null
          repo_url: string | null
          skills: string[]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tech_stack: string[]
          title: string
          updated_at: string
        }
        Insert: {
          architecture?: string | null
          cover_image_url?: string | null
          created_at?: string
          demo_url?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          extensions?: string[]
          id?: string
          outcome?: string | null
          portfolio_advice?: string | null
          prerequisites?: string[]
          problem?: string | null
          repo_url?: string | null
          skills?: string[]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tech_stack?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          architecture?: string | null
          cover_image_url?: string | null
          created_at?: string
          demo_url?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          extensions?: string[]
          id?: string
          outcome?: string | null
          portfolio_advice?: string | null
          prerequisites?: string[]
          problem?: string | null
          repo_url?: string | null
          skills?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tech_stack?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_index: number
          explanation: string | null
          id: string
          options: Json
          position: number
          prompt: string
          quiz_id: string
        }
        Insert: {
          correct_index?: number
          explanation?: string | null
          id?: string
          options?: Json
          position?: number
          prompt: string
          quiz_id: string
        }
        Update: {
          correct_index?: number
          explanation?: string | null
          id?: string
          options?: Json
          position?: number
          prompt?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          audience: string[]
          category: string
          cost: string
          created_at: string
          description: string | null
          has_free_tier: boolean
          id: string
          is_official: boolean
          last_reviewed: string | null
          level: Database["public"]["Enums"]["difficulty"]
          organization: string | null
          rating: number | null
          resource_type: string
          reviewer_notes: string | null
          save_count: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          audience?: string[]
          category?: string
          cost?: string
          created_at?: string
          description?: string | null
          has_free_tier?: boolean
          id?: string
          is_official?: boolean
          last_reviewed?: string | null
          level?: Database["public"]["Enums"]["difficulty"]
          organization?: string | null
          rating?: number | null
          resource_type?: string
          reviewer_notes?: string | null
          save_count?: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          audience?: string[]
          category?: string
          cost?: string
          created_at?: string
          description?: string | null
          has_free_tier?: boolean
          id?: string
          is_official?: boolean
          last_reviewed?: string | null
          level?: Database["public"]["Enums"]["difficulty"]
          organization?: string | null
          rating?: number | null
          resource_type?: string
          reviewer_notes?: string | null
          save_count?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      roadmap_edges: {
        Row: {
          id: string
          kind: string
          roadmap_id: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          id?: string
          kind?: string
          roadmap_id: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          id?: string
          kind?: string
          roadmap_id?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_edges_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "roadmap_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "roadmap_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_nodes: {
        Row: {
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          estimated_hours: number | null
          group_label: string | null
          id: string
          position_x: number
          position_y: number
          roadmap_id: string
          skills: string[]
          slug: string
          sort: number
          title: string
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          group_label?: string | null
          id?: string
          position_x?: number
          position_y?: number
          roadmap_id: string
          skills?: string[]
          slug: string
          sort?: number
          title: string
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          group_label?: string | null
          id?: string
          position_x?: number
          position_y?: number
          roadmap_id?: string
          skills?: string[]
          slug?: string
          sort?: number
          title?: string
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_nodes_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          career_id: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          estimated_hours: number | null
          id: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          career_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          career_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          estimated_hours?: number | null
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      search_queries: {
        Row: {
          created_at: string
          id: string
          query: string
          results_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          results_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          results_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          kind: string
          label: string
          slug: string
        }
        Insert: {
          id?: string
          kind?: string
          label: string
          slug: string
        }
        Update: {
          id?: string
          kind?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          pricing: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tagline: string | null
          tags: string[]
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pricing?: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tagline?: string | null
          tags?: string[]
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pricing?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tagline?: string | null
          tags?: string[]
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          slug: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          slug: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          slug?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      upload_files: {
        Row: {
          created_at: string
          id: string
          mime: string | null
          note: string | null
          path: string | null
          section_id: string
          size: number | null
          sort_order: number
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime?: string | null
          note?: string | null
          path?: string | null
          section_id: string
          size?: number | null
          sort_order?: number
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime?: string | null
          note?: string | null
          path?: string | null
          section_id?: string
          size?: number | null
          sort_order?: number
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_files_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "upload_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_sections: {
        Row: {
          category: string
          created_at: string
          description: string | null
          entity_slug: string | null
          entity_type: string | null
          id: string
          published: boolean
          slug: string
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          entity_slug?: string | null
          entity_type?: string | null
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          entity_slug?: string | null
          entity_type?: string | null
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_type: string | null
          kind: string
          metadata: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          kind: string
          metadata?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          kind?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          id: string
          item_id: string
          item_type: string
          percent: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          item_type: string
          percent?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          item_type?: string
          percent?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saves: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_editor: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "editor" | "admin" | "super_admin"
      content_status: "draft" | "review" | "published" | "archived"
      difficulty: "beginner" | "intermediate" | "advanced"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "editor", "admin", "super_admin"],
      content_status: ["draft", "review", "published", "archived"],
      difficulty: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
