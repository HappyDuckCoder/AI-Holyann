-- Profile Analysis Schema Update
-- Mở rộng bảng profile_analyses để lưu đầy đủ kết quả phân tích AI Feature 1

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Input data (data sent to AI)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='input_data') THEN
        ALTER TABLE profile_analyses ADD COLUMN input_data JSONB DEFAULT '{}';
    END IF;

    -- Full AI response
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='full_result') THEN
        ALTER TABLE profile_analyses ADD COLUMN full_result JSONB DEFAULT '{}';
    END IF;

    -- Pillar Scores (quick access)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='score_aca') THEN
        ALTER TABLE profile_analyses ADD COLUMN score_aca FLOAT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='score_lan') THEN
        ALTER TABLE profile_analyses ADD COLUMN score_lan FLOAT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='score_hdnk') THEN
        ALTER TABLE profile_analyses ADD COLUMN score_hdnk FLOAT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='score_skill') THEN
        ALTER TABLE profile_analyses ADD COLUMN score_skill FLOAT;
    END IF;

    -- Regional Scores (quick access)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='score_usa') THEN
        ALTER TABLE profile_analyses ADD COLUMN score_usa FLOAT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='score_asia') THEN
        ALTER TABLE profile_analyses ADD COLUMN score_asia FLOAT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='score_europe') THEN
        ALTER TABLE profile_analyses ADD COLUMN score_europe FLOAT;
    END IF;

    -- Spike Info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='main_spike') THEN
        ALTER TABLE profile_analyses ADD COLUMN main_spike VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='spike_sharpness') THEN
        ALTER TABLE profile_analyses ADD COLUMN spike_sharpness VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='spike_score') THEN
        ALTER TABLE profile_analyses ADD COLUMN spike_score FLOAT;
    END IF;

    -- All Spike Scores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='all_spike_scores') THEN
        ALTER TABLE profile_analyses ADD COLUMN all_spike_scores JSONB DEFAULT '{}';
    END IF;

    -- Updated at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profile_analyses' AND column_name='updated_at') THEN
        ALTER TABLE profile_analyses ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_analyses_main_spike
    ON profile_analyses(main_spike);

CREATE INDEX IF NOT EXISTS idx_profile_analyses_analysis_date
    ON profile_analyses(analysis_date DESC);

-- Add comment to table
COMMENT ON TABLE profile_analyses IS 'Lưu kết quả phân tích hồ sơ AI (Feature 1) của học sinh';

-- Column comments
COMMENT ON COLUMN profile_analyses.input_data IS 'Dữ liệu input gửi đến AI server';
COMMENT ON COLUMN profile_analyses.full_result IS 'Kết quả đầy đủ từ AI server';
COMMENT ON COLUMN profile_analyses.score_aca IS 'Điểm Học thuật (0-100)';
COMMENT ON COLUMN profile_analyses.score_lan IS 'Điểm Ngôn ngữ (0-100)';
COMMENT ON COLUMN profile_analyses.score_hdnk IS 'Điểm Hoạt động ngoại khóa (0-100)';
COMMENT ON COLUMN profile_analyses.score_skill IS 'Điểm Kỹ năng (0-100)';
COMMENT ON COLUMN profile_analyses.score_usa IS 'Điểm tổng hợp khu vực Mỹ';
COMMENT ON COLUMN profile_analyses.score_asia IS 'Điểm tổng hợp khu vực Châu Á';
COMMENT ON COLUMN profile_analyses.score_europe IS 'Điểm tổng hợp khu vực Âu/Úc/Canada';
COMMENT ON COLUMN profile_analyses.main_spike IS 'Loại Spike chính (Academic Excellence, Research, etc.)';
COMMENT ON COLUMN profile_analyses.spike_sharpness IS 'Độ sắc của Spike (Exceptional, High, Med, Low)';
COMMENT ON COLUMN profile_analyses.spike_score IS 'Điểm số của Spike chính';
COMMENT ON COLUMN profile_analyses.all_spike_scores IS 'Điểm số tất cả 12 loại Spike';
