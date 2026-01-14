-- Add DELETE policy for settings table to allow users to delete their own settings
CREATE POLICY "Users can delete their own settings"
ON public.settings
FOR DELETE
USING (auth.uid() = user_id);