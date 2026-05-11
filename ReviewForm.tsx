import React from 'react';
import { Star, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(rating, comment);
      setComment('');
      setRating(5);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-[#141414] rounded-3xl border border-yellow-500/20"
    >
      <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-6">เขียนรีวิวของคุณ</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">ให้คะแนนความพึงพอใจ</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform active:scale-90"
              >
                <Star 
                  className={`w-8 h-8 ${
                    (hover || rating) >= star 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-700'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">ความคิดเห็นของคุณ</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="แชร์ประสบการณ์การใช้งาน EA ตัวนี้..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors min-h-[120px] resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!comment.trim()}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
        >
          ส่งรีวิว
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
