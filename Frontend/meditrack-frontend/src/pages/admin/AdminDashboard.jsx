import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BedDouble,
  Building2,
  ClipboardPlus,
  LayoutDashboard,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  Users2,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { adminApi } from "../../api/adminApi";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "hospitals", label: "Hospitals", icon: Building2 },
  { key: "rooms", label: "Rooms", icon: BedDouble },
  { key: "receptionists", label: "Receptionists", icon: Users2 },
];

const initialHospitalForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  phoneNumber: "",
  totalBeds: "",
};

const initialRoomForm = {
  hospitalId: "",
  roomNumber: "",
  ward: "",
  totalBeds: "",
};

const initialReceptionistForm = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  hospitalId: "",
  phoneNumber: "",
  shift: "",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "Not available";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    hospitals: [],
    rooms: [],
    receptionists: [],
  });
  const [forms, setForms] = useState({
    hospital: initialHospitalForm,
    room: initialRoomForm,
    receptionist: initialReceptionistForm,
  });
  const [editing, setEditing] = useState({
    hospital: null,
    room: null,
    receptionist: null,
  });
  const [submitting, setSubmitting] = useState({
    hospital: false,
    room: false,
    receptionist: false,
  });
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalSearch, setHospitalSearch] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [hospitals, rooms, receptionists] = await Promise.all([
        adminApi.getHospitals(),
        adminApi.getRooms(),
        adminApi.getReceptionists(),
      ]);
      setData({ hospitals, rooms, receptionists });
      setSelectedHospital((prev) => {
        if (!prev) return hospitals[0] ?? null;
        return (
          hospitals.find((hospital) => hospital.id === prev.id) ??
          hospitals[0] ??
          null
        );
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to load admin data.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const hospitalLookup = useMemo(() => {
    const lookup = new Map();
    data.hospitals.forEach((hospital) => lookup.set(hospital.id, hospital));
    return lookup;
  }, [data.hospitals]);

  const stats = useMemo(() => {
    const totalBeds = data.hospitals.reduce(
      (acc, hospital) => acc + (Number(hospital.totalBeds) || 0),
      0
    );
    const occupiedBeds = data.hospitals.reduce(
      (acc, hospital) => acc + (Number(hospital.occupiedBeds) || 0),
      0
    );
    return [
      {
        label: "Hospitals",
        value: data.hospitals.length,
        icon: Building2,
        description: "Active facilities",
      },
      {
        label: "Total Beds",
        value: totalBeds,
        icon: BedDouble,
        description: "Across all hospitals",
      },
      {
        label: "Occupied Beds",
        value: occupiedBeds,
        icon: Activity,
        description: "Reported usage",
      },
      {
        label: "Receptionists",
        value: data.receptionists.length,
        icon: Users2,
        description: "Hospital contact points",
      },
    ];
  }, [data.hospitals, data.receptionists]);

  const filteredHospitals = useMemo(() => {
    if (!hospitalSearch.trim()) return data.hospitals;
    return data.hospitals.filter((hospital) =>
      hospital.name.toLowerCase().includes(hospitalSearch.toLowerCase())
    );
  }, [data.hospitals, hospitalSearch]);

  const handleInputChange = (section, field, value) => {
    setForms((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const resetForm = (section) => {
    setForms((prev) => ({
      ...prev,
      [section]:
        section === "hospital"
          ? initialHospitalForm
          : section === "room"
          ? initialRoomForm
          : initialReceptionistForm,
    }));
    setEditing((prev) => ({ ...prev, [section]: null }));
  };

  const submittingLabel = (section) =>
    editing[section] ? "Update" : "Create";

  const handleHospitalSubmit = async (event) => {
    event.preventDefault();
    setSubmitting((prev) => ({ ...prev, hospital: true }));
    const payload = {
      ...forms.hospital,
      totalBeds: forms.hospital.totalBeds
        ? Number(forms.hospital.totalBeds)
        : 0,
    };
    try {
      if (editing.hospital) {
        await adminApi.updateHospital(editing.hospital.id, payload);
        toast.success("Hospital updated");
      } else {
        await adminApi.createHospital(payload);
        toast.success("Hospital created");
      }
      resetForm("hospital");
      await fetchDashboardData();
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to save hospital.";
      toast.error(message);
    } finally {
      setSubmitting((prev) => ({ ...prev, hospital: false }));
    }
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();
    setSubmitting((prev) => ({ ...prev, room: true }));
    const payload = {
      ...forms.room,
      hospitalId: Number(forms.room.hospitalId),
      totalBeds: forms.room.totalBeds ? Number(forms.room.totalBeds) : 0,
    };
    try {
      if (editing.room) {
        await adminApi.updateRoom(editing.room.id, payload);
        toast.success("Room updated");
      } else {
        await adminApi.createRoom(payload);
        toast.success("Room created");
      }
      resetForm("room");
      await fetchDashboardData();
    } catch (error) {
      const message = error.response?.data?.message || "Unable to save room.";
      toast.error(message);
    } finally {
      setSubmitting((prev) => ({ ...prev, room: false }));
    }
  };

  const handleReceptionistSubmit = async (event) => {
    event.preventDefault();
    setSubmitting((prev) => ({ ...prev, receptionist: true }));
    const payload = {
      ...forms.receptionist,
      hospitalId: Number(forms.receptionist.hospitalId),
    };
    try {
      if (editing.receptionist) {
        await adminApi.updateReceptionist(editing.receptionist.id, payload);
        toast.success("Receptionist updated");
      } else {
        await adminApi.createReceptionist(payload);
        toast.success("Receptionist created");
      }
      resetForm("receptionist");
      await fetchDashboardData();
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to save receptionist.";
      toast.error(message);
    } finally {
      setSubmitting((prev) => ({ ...prev, receptionist: false }));
    }
  };

  const handleDelete = async (type, entity) => {
    const confirmation = confirm(
      `Are you sure you want to delete this ${type}?`
    );
    if (!confirmation) return;
    try {
      if (type === "hospital") {
        await adminApi.deleteHospital(entity.id);
      } else if (type === "room") {
        await adminApi.deleteRoom(entity.id);
      } else {
        await adminApi.deleteReceptionist(entity.id);
      }
      toast.success(`${type} deleted`);
      await fetchDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Unable to delete ${type}.`
      );
    }
  };

  const overviewSection = (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
                <Icon className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Spotlight
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                Hospitals with most beds
              </h2>
            </div>
            <ShieldCheck className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[...data.hospitals]
              .sort(
                (a, b) => (b.totalBeds || 0) - (a.totalBeds || 0)
              )
              .slice(0, 4)
              .map((hospital) => (
                <div
                  key={hospital.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div>
                    <p className="font-semibold">{hospital.name}</p>
                    <p className="text-sm text-slate-500">
                      {hospital.city}, {hospital.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {hospital.totalBeds ?? 0}
                    </p>
                    <p className="text-xs text-slate-500">beds</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Team
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                Recently added receptionists
              </h2>
            </div>
            <ClipboardPlus className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[...data.receptionists]
              .slice(-4)
              .reverse()
              .map((receptionist) => (
                <div
                  key={receptionist.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {receptionist.firstName} {receptionist.lastName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {receptionist.email}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    {hospitalLookup.get(receptionist.hospitalId)?.name ||
                      "N/A"}
                  </p>
                </div>
              ))}
            {data.receptionists.length === 0 && (
              <p className="text-sm text-slate-500">
                No receptionists created yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const hospitalsSection = (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Manage
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Hospitals
            </h2>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospitals..."
              value={hospitalSearch}
              onChange={(event) => setHospitalSearch(event.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <th className="px-3 py-2 rounded-l-lg">Name</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Beds</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHospitals.map((hospital) => (
                <tr
                  key={hospital.id}
                  className={`hover:bg-slate-50/70 transition cursor-pointer ${
                    selectedHospital?.id === hospital.id
                      ? "bg-slate-50/90"
                      : ""
                  }`}
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <td className="px-3 py-4 font-semibold">{hospital.name}</td>
                  <td className="px-3 py-4 text-slate-500">
                    {hospital.city}, {hospital.state}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {hospital.totalBeds ?? 0}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {hospital.phoneNumber || "N/A"}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditing((prev) => ({ ...prev, hospital }));
                          setForms((prev) => ({
                            ...prev,
                            hospital: {
                              name: hospital.name ?? "",
                              address: hospital.address ?? "",
                              city: hospital.city ?? "",
                              state: hospital.state ?? "",
                              phoneNumber: hospital.phoneNumber ?? "",
                              totalBeds: hospital.totalBeds ?? "",
                            },
                          }));
                        }}
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete("hospital", hospital);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHospitals.length === 0 && (
                <tr>
                  <td
                    className="text-center text-slate-500 py-10"
                    colSpan={5}
                  >
                    No hospitals match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {editing.hospital ? "Update" : "Add"}
              </p>
              <h3 className="text-lg font-semibold">
                {editing.hospital ? "Edit hospital" : "New hospital"}
              </h3>
            </div>
            <PlusCircle className="w-5 h-5 text-slate-400" />
          </div>
          <form className="space-y-3" onSubmit={handleHospitalSubmit}>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
              placeholder="Hospital name"
              value={forms.hospital.name}
              onChange={(event) =>
                handleInputChange("hospital", "name", event.target.value)
              }
              required
            />
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
              placeholder="Street address"
              value={forms.hospital.address}
              onChange={(event) =>
                handleInputChange("hospital", "address", event.target.value)
              }
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
                placeholder="City"
                value={forms.hospital.city}
                onChange={(event) =>
                  handleInputChange("hospital", "city", event.target.value)
                }
                required
              />
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
                placeholder="State"
                value={forms.hospital.state}
                onChange={(event) =>
                  handleInputChange("hospital", "state", event.target.value)
                }
                required
              />
            </div>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
              placeholder="Contact number"
              value={forms.hospital.phoneNumber}
              onChange={(event) =>
                handleInputChange(
                  "hospital",
                  "phoneNumber",
                  event.target.value
                )
              }
              required
            />
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
              placeholder="Total beds"
              value={forms.hospital.totalBeds}
              onChange={(event) =>
                handleInputChange("hospital", "totalBeds", event.target.value)
              }
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
                disabled={submitting.hospital}
              >
                {submitting.hospital ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  `${submittingLabel("hospital")} hospital`
                )}
              </button>
              {editing.hospital && (
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
                  onClick={() => resetForm("hospital")}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Focus
          </p>
          <h3 className="text-lg font-semibold mb-4">Hospital details</h3>
          {selectedHospital ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase">Name</p>
                <p className="font-semibold">{selectedHospital.name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Location</p>
                <p className="font-medium">
                  {selectedHospital.address}
                  <br />
                  {selectedHospital.city}, {selectedHospital.state}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs text-slate-500 uppercase">Beds</p>
                  <p className="text-lg font-semibold">
                    {selectedHospital.totalBeds ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs text-slate-500 uppercase">Occupied</p>
                  <p className="text-lg font-semibold">
                    {selectedHospital.occupiedBeds ?? 0}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Contact</p>
                <p className="font-medium">
                  {selectedHospital.phoneNumber || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Last update</p>
                <p className="font-medium">
                  {formatDate(selectedHospital.updatedAt)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Select a hospital to see more details.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const roomsSection = (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Manage
            </p>
            <h2 className="text-xl font-semibold text-slate-900">Rooms</h2>
          </div>
          <p className="text-sm text-slate-500">
            {data.rooms.length} total rooms
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <th className="px-3 py-2 rounded-l-lg">Hospital</th>
                <th className="px-3 py-2">Room #</th>
                <th className="px-3 py-2">Ward</th>
                <th className="px-3 py-2">Beds</th>
                <th className="px-3 py-2 rounded-r-lg text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-3 py-4 font-semibold">
                    {hospitalLookup.get(room.hospitalId)?.name ||
                      room.hospitalName ||
                      "Unknown"}
                  </td>
                  <td className="px-3 py-4 text-slate-500">{room.roomNumber}</td>
                  <td className="px-3 py-4 text-slate-500">{room.ward}</td>
                  <td className="px-3 py-4 text-slate-500">
                    {room.totalBeds ?? 0}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                        onClick={() => {
                          setEditing((prev) => ({ ...prev, room }));
                          setForms((prev) => ({
                            ...prev,
                            room: {
                              hospitalId: room.hospitalId ?? "",
                              roomNumber: room.roomNumber ?? "",
                              ward: room.ward ?? "",
                              totalBeds: room.totalBeds ?? "",
                            },
                          }));
                        }}
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition"
                        onClick={() => void handleDelete("room", room)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.rooms.length === 0 && (
                <tr>
                  <td className="text-center text-slate-500 py-10" colSpan={5}>
                    No rooms have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {editing.room ? "Update" : "Add"}
            </p>
            <h3 className="text-lg font-semibold">
              {editing.room ? "Edit room" : "New room"}
            </h3>
          </div>
          <BedDouble className="w-5 h-5 text-slate-400" />
        </div>
        <form className="space-y-3" onSubmit={handleRoomSubmit}>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            value={forms.room.hospitalId}
            onChange={(event) =>
              handleInputChange("room", "hospitalId", event.target.value)
            }
            required
          >
            <option value="">Select hospital</option>
            {data.hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </option>
            ))}
          </select>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Room number"
            value={forms.room.roomNumber}
            onChange={(event) =>
              handleInputChange("room", "roomNumber", event.target.value)
            }
            required
          />
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Ward / Unit"
            value={forms.room.ward}
            onChange={(event) =>
              handleInputChange("room", "ward", event.target.value)
            }
            required
          />
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Total beds"
            value={forms.room.totalBeds}
            onChange={(event) =>
              handleInputChange("room", "totalBeds", event.target.value)
            }
            required
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
              disabled={submitting.room}
            >
              {submitting.room ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                `${submittingLabel("room")} room`
              )}
            </button>
            {editing.room && (
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
                onClick={() => resetForm("room")}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  const receptionistsSection = (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Manage
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Receptionists
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {data.receptionists.length} assigned contacts
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <th className="px-3 py-2 rounded-l-lg">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Hospital</th>
                <th className="px-3 py-2">Shift</th>
                <th className="px-3 py-2 rounded-r-lg text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.receptionists.map((receptionist) => (
                <tr
                  key={receptionist.id}
                  className="hover:bg-slate-50/70 transition"
                >
                  <td className="px-3 py-4 font-semibold">
                    {receptionist.firstName} {receptionist.lastName}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {receptionist.email}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {hospitalLookup.get(receptionist.hospitalId)?.name ||
                      receptionist.hospitalName ||
                      "Unknown"}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {receptionist.shift || "N/A"}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                        onClick={() => {
                          setEditing((prev) => ({
                            ...prev,
                            receptionist,
                          }));
                          setForms((prev) => ({
                            ...prev,
                            receptionist: {
                              username: receptionist.username ?? "",
                              email: receptionist.email ?? "",
                              password: "",
                              firstName: receptionist.firstName ?? "",
                              lastName: receptionist.lastName ?? "",
                              hospitalId: receptionist.hospitalId ?? "",
                              phoneNumber: receptionist.phoneNumber ?? "",
                              shift: receptionist.shift ?? "",
                            },
                          }));
                        }}
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition"
                        onClick={() =>
                          void handleDelete("receptionist", receptionist)
                        }
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.receptionists.length === 0 && (
                <tr>
                  <td className="text-center text-slate-500 py-10" colSpan={5}>
                    No receptionists assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {editing.receptionist ? "Update" : "Add"}
            </p>
            <h3 className="text-lg font-semibold">
              {editing.receptionist ? "Edit receptionist" : "New receptionist"}
            </h3>
          </div>
          <ShieldCheck className="w-5 h-5 text-slate-400" />
        </div>
        <form className="space-y-3" onSubmit={handleReceptionistSubmit}>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Username"
            value={forms.receptionist.username}
            onChange={(event) =>
              handleInputChange("receptionist", "username", event.target.value)
            }
            required
          />
          <input
            type="email"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Email"
            value={forms.receptionist.email}
            onChange={(event) =>
              handleInputChange("receptionist", "email", event.target.value)
            }
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
              placeholder="First name"
              value={forms.receptionist.firstName}
              onChange={(event) =>
                handleInputChange(
                  "receptionist",
                  "firstName",
                  event.target.value
                )
              }
              required
            />
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
              placeholder="Last name"
              value={forms.receptionist.lastName}
              onChange={(event) =>
                handleInputChange(
                  "receptionist",
                  "lastName",
                  event.target.value
                )
              }
              required
            />
          </div>
          <input
            type="password"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Password"
            value={forms.receptionist.password}
            onChange={(event) =>
              handleInputChange(
                "receptionist",
                "password",
                event.target.value
              )
            }
            required
          />
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Phone number"
            value={forms.receptionist.phoneNumber}
            onChange={(event) =>
              handleInputChange(
                "receptionist",
                "phoneNumber",
                event.target.value
              )
            }
            required
          />
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            value={forms.receptionist.hospitalId}
            onChange={(event) =>
              handleInputChange(
                "receptionist",
                "hospitalId",
                event.target.value
              )
            }
            required
          >
            <option value="">Assign hospital</option>
            {data.hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </option>
            ))}
          </select>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            value={forms.receptionist.shift}
            onChange={(event) =>
              handleInputChange("receptionist", "shift", event.target.value)
            }
          >
            <option value="">Select shift (optional)</option>
            <option value="DAY">Day</option>
            <option value="NIGHT">Night</option>
            <option value="ROTATIONAL">Rotational</option>
          </select>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
              disabled={submitting.receptionist}
            >
              {submitting.receptionist ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                `${submittingLabel("receptionist")} receptionist`
              )}
            </button>
            {editing.receptionist && (
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
                onClick={() => resetForm("receptionist")}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  const contentBySection = {
    overview: overviewSection,
    hospitals: hospitalsSection,
    rooms: roomsSection,
    receptionists: receptionistsSection,
  };

  return (
    <DashboardLayout
      title="Bed Availability Control Center"
      subtitle="National hospital network"
      sidebarItems={sections}
      activeKey={activeSection}
      onSelect={setActiveSection}
      user={null}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p>Fetching the latest hospital data...</p>
        </div>
      ) : (
        contentBySection[activeSection]
      )}
    </DashboardLayout>
  );
}


