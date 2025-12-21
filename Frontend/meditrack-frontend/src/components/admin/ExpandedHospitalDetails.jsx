import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Loader2,
  Building2,
  MapPin,
  Phone,
  BedDouble,
  Users,
  Star,
  MessageSquare,
  User,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { motion } from "framer-motion";

export const ExpandedHospitalDetails = ({ hospital }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch reviews when tab changes to 'reviews'
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, hospital.id]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      // Calling future endpoint inside adminApi
      const response = await adminApi.getHospitalReviews(hospital.id);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Failed to load reviews", error);
      setReviews([]); // Fail gracefully
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (
      !confirm("Are you sure you want to remove this review? This cannot be undone.")
    )
      return;
    try {
      await adminApi.deleteReview(hospital.id, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review removed successfully");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const occupancyRate =
    hospital.totalBeds > 0
      ? Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-t border-slate-100 mt-4 pt-2"
    >
      {/* Internal Tabs */}
      <div className="flex gap-6 border-b border-slate-100 mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab("overview");
          }}
          className={`py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-teal-500 text-teal-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Overview
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab("reviews");
          }}
          className={`py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "reviews"
              ? "border-teal-500 text-teal-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Reviews
        </button>
      </div>

      <div className="min-h-[200px]">
        {activeTab === "overview" ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-center">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Capacity
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-900">
                  <BedDouble size={18} />
                  <span className="text-lg font-black">
                    {hospital.totalBeds || 0}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/50 text-center">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  Occupied
                </p>
                <div className="flex items-center justify-center gap-2 text-orange-900">
                  <Users size={18} />
                  <span className="text-lg font-black">
                    {hospital.occupiedBeds || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Occupancy Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Occupancy Status</span>
                <span
                  className={
                    occupancyRate > 90 ? "text-red-500" : "text-teal-600"
                  }
                >
                  {occupancyRate}% Full
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 rounded-full ${
                    occupancyRate > 90
                      ? "bg-red-500"
                      : occupancyRate > 70
                      ? "bg-orange-400"
                      : "bg-teal-500"
                  }`}
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 text-xs text-slate-500">
              <Activity size={14} className="text-slate-400" />
              <span className="font-mono">
                Lat: {hospital.latitude?.toFixed(4)}
              </span>
              <span className="w-px h-3 bg-slate-300"></span>
              <span className="font-mono">
                Lng: {hospital.longitude?.toFixed(4)}
              </span>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                User Feedback
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                Admin View
              </span>
            </div>

            {loadingReviews ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-5 h-5 animate-spin mb-2" />
                <span className="text-xs">Fetching reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No reviews found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-red-100 group transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                          {review.fullname ? review.fullname[0] : "U"}
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {review.fullname || "Anonymous"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(review.id);
                        }}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex text-amber-400 mb-1.5 pl-8">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          fill={i < review.rating ? "currentColor" : "none"}
                          className={i < review.rating ? "" : "text-slate-200"}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
