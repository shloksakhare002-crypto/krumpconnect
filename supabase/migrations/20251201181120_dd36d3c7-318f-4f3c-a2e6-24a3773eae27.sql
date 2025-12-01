-- Create battle_results table for dual-confirmation system
CREATE TABLE public.battle_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.battle_challenges(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  result TEXT NOT NULL CHECK (result IN ('won', 'lost', 'draw')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, reporter_id)
);

-- Enable RLS
ALTER TABLE public.battle_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can report results for their own battles
CREATE POLICY "Users can report battle results"
ON public.battle_results
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM battle_challenges bc
    JOIN profiles p ON p.id = battle_results.reporter_id
    WHERE bc.id = battle_results.challenge_id
    AND (bc.challenger_id = p.id OR bc.challenged_id = p.id)
    AND p.user_id = auth.uid()
  )
);

-- Policy: Battle participants can view results
CREATE POLICY "Participants can view battle results"
ON public.battle_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM battle_challenges bc
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE bc.id = battle_results.challenge_id
    AND (bc.challenger_id = p.id OR bc.challenged_id = p.id)
  )
);

-- Function to process confirmed battle results
CREATE OR REPLACE FUNCTION process_battle_result()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge_rec RECORD;
  reporter_result TEXT;
  opponent_result TEXT;
  opponent_id UUID;
BEGIN
  -- Get challenge details
  SELECT * INTO challenge_rec
  FROM battle_challenges
  WHERE id = NEW.challenge_id;
  
  -- Determine opponent
  IF NEW.reporter_id = challenge_rec.challenger_id THEN
    opponent_id := challenge_rec.challenged_id;
  ELSE
    opponent_id := challenge_rec.challenger_id;
  END IF;
  
  -- Check if opponent has also reported
  SELECT result INTO opponent_result
  FROM battle_results
  WHERE challenge_id = NEW.challenge_id
  AND reporter_id = opponent_id;
  
  -- If both have reported, validate and update records
  IF opponent_result IS NOT NULL THEN
    reporter_result := NEW.result;
    
    -- Verify results match (won vs lost, or both draw)
    IF (reporter_result = 'draw' AND opponent_result = 'draw') OR
       (reporter_result = 'won' AND opponent_result = 'lost') OR
       (reporter_result = 'lost' AND opponent_result = 'won') THEN
      
      -- Update battle records based on confirmed result
      IF reporter_result = 'won' THEN
        -- Reporter won
        UPDATE profiles SET battle_wins = battle_wins + 1 WHERE id = NEW.reporter_id;
        UPDATE profiles SET battle_losses = battle_losses + 1 WHERE id = opponent_id;
      ELSIF reporter_result = 'lost' THEN
        -- Reporter lost
        UPDATE profiles SET battle_losses = battle_losses + 1 WHERE id = NEW.reporter_id;
        UPDATE profiles SET battle_wins = battle_wins + 1 WHERE id = opponent_id;
      ELSIF reporter_result = 'draw' THEN
        -- Draw
        UPDATE profiles SET battle_draws = battle_draws + 1 WHERE id = NEW.reporter_id;
        UPDATE profiles SET battle_draws = battle_draws + 1 WHERE id = opponent_id;
      END IF;
      
      -- Mark challenge as completed
      UPDATE battle_challenges SET status = 'completed' WHERE id = NEW.challenge_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-process when both results submitted
CREATE TRIGGER process_battle_result_trigger
AFTER INSERT ON public.battle_results
FOR EACH ROW
EXECUTE FUNCTION process_battle_result();