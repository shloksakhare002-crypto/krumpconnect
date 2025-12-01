-- Enable realtime for sessions table
ALTER TABLE public.sessions REPLICA IDENTITY FULL;

-- Enable realtime for battle_challenges table
ALTER TABLE public.battle_challenges REPLICA IDENTITY FULL;

-- Enable realtime for session_requests table
ALTER TABLE public.session_requests REPLICA IDENTITY FULL;