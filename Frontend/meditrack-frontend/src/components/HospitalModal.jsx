import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  MapPin,
  Phone,
  BedDouble,
  Building2,
  Star,
  Activity,
  MessageSquare,
  Send,
  User,
} from "lucide-react";

const HospitalModal = ({ hospital, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'reviews'

  // Data State
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. FETCH REVIEWS ON LOAD ---
  useEffect(() => {
    if (hospital?.id) {
      fetchReviews();
    }
  }, [hospital]);

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/hospitals/reviews/${hospital.id}`
      );
      if (response.data && response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // --- 2. SUBMIT REVIEW ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token"); // Assuming you store JWT here
      if (!token) {
        alert("You must be logged in to post a review.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        rating: rating,
        comment: comment,
      };

      const response = await axios.post(
        `http://localhost:8080/hospitals/${hospital.id}/reviews`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Add new review to top of list immediately
        setReviews([response.data.data, ...reviews]);

        // Reset form
        setComment("");
        setRating(0);
      }
    } catch (error) {
      console.error("Error posting review:", error);
      alert(error.response?.data?.message || "Failed to post review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hospital) return null;

  // --- DERIVED DATA ---
  const occupancyRate =
    hospital.totalBeds > 0
      ? Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100)
      : 0;

  const getOccupancyColor = (rate) => {
    if (rate < 50) return "bg-green-500";
    if (rate < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Check if user is logged in for UI purposes
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-md"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <Building2 className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {hospital.name}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-blue-100 text-sm font-medium">
                <MapPin size={16} />
                <span>
                  {hospital.city}, {hospital.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`mr-6 py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* --- SCROLLABLE CONTENT AREA --- */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {activeTab === "overview" ? (
            <div className="space-y-8">
              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rating Card */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col items-center justify-center text-center">
                  <div className="bg-amber-100 p-2 rounded-full mb-2 text-amber-600">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {/* Calculate dynamic average based on fetched reviews if needed, or use static */}
                    {hospital.averageRating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Avg Rating
                  </p>
                </div>

                {/* Total Rooms Card */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
                  <div className="bg-blue-100 p-2 rounded-full mb-2 text-blue-600">
                    <Building2 size={20} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {hospital.totalRooms || 0}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Total Rooms
                  </p>
                </div>

                {/* Occupied Count Card */}
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center">
                  <div className="bg-emerald-100 p-2 rounded-full mb-2 text-emerald-600">
                    <Activity size={20} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {hospital.occupiedBeds || 0}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Active Patients
                  </p>
                </div>
              </div>

              {/* BED OCCUPANCY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BedDouble className="text-blue-600" size={20} />
                    Bed Capacity
                  </h3>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      occupancyRate > 80
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {occupancyRate}% Full
                  </span>
                </div>

                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${getOccupancyColor(
                      occupancyRate
                    )} transition-all duration-1000 ease-out`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>{hospital.occupiedBeds} Occupied</span>
                  <span>{hospital.totalBeds} Total Capacity</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* DETAILS LIST */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Address Details
                  </p>
                  <div className="flex items-start gap-3 mt-2">
                    <MapPin
                      className="text-slate-400 shrink-0 mt-1"
                      size={18}
                    />
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {hospital.address}
                      <br />
                      {hospital.city}, {hospital.state}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Contact Information
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Phone className="text-slate-400 shrink-0" size={18} />
                    <p className="text-slate-700 font-medium">
                      {hospital.contactNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // --- REVIEWS TAB CONTENT ---
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* WRITE REVIEW SECTION */}
              {isLoggedIn ? (
                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <MessageSquare size={16} /> Write a Review
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600 mr-2">
                        Your Rating:
                      </span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={
                              star <= (hoverRating || rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this hospital..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm outline-none resize-none bg-white"
                      rows={3}
                      maxLength={2000}
                      required
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={
                          rating === 0 || !comment.trim() || isSubmitting
                        }
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                      >
                        <Send size={16} />
                        {isSubmitting ? "Submitting..." : "Post Review"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-slate-500 text-sm">
                    Please log in to write a review.
                  </p>
                </div>
              )}

              {/* REVIEW LIST */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Recent Reviews
                </h3>

                {isLoadingReviews ? (
                  <p className="text-center text-slate-500 py-4">
                    Loading reviews...
                  </p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={14} />
                          </div>
                          <div>
                            {/* MATCHED TO RESPONSE DTO: fullname */}
                            <p className="text-sm font-bold text-slate-800">
                              {review.fullname || "Anonymous User"}
                            </p>
                            {/* MATCHED TO RESPONSE DTO: createdAt */}
                            <p className="text-xs text-slate-400">
                              {review.createdAt
                                ? new Date(
                                    review.createdAt
                                  ).toLocaleDateString()
                                : "Recently"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <MessageSquare
                      className="mx-auto mb-2 opacity-50"
                      size={32}
                    />
                    <p>
                      No reviews yet. Be the first to share your experience!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition shadow-sm hover:shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalModal;
