import { useEffect, useState } from "react";
import { Dropdown, Table, Modal, Button, TextInput, Select, Textarea } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function MembershipTable() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    applicationFor: '',
    paymentStatus: '',
    memberStatus: '',
    visaStatus: '',
    district: '',
    search: ''
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const limit = 10;

  // Initialize usePutData hook for member updates
  const updateMemberMutation = usePutData("MemberData", "");

  // Build query string with filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', limit);

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.append(key, value);
      }
    });

    return params.toString();
  };

  // Build the URL dynamically based on current filters and page
  const apiUrl = `/members?${buildQueryString()}`;

  // Debug: Log the API URL to verify filters are being applied
  console.log('API URL:', apiUrl);
  console.log('Current filters:', filters);

  const { data: memberData, isLoading, error, refetch } = useGetData(
    "MemberData",
    apiUrl,
    {
      // Add dependencies to ensure the query updates when filters change
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleViewForm = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);

  };

  const handleAccept = async (member) => {
    try {
      const updateData = {
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        memberStatus: "accepted",
        rejectionNotes: "",
        paymentStatus: member.paymentStatus
      };

      await updateMemberMutation.mutateAsync({
        url: `/members/${member._id}`,
        data: updateData
      });

      // The success handling is now done in the mutation's onSuccess callback
      refetch();
    } catch (error) {
      console.error("Error accepting member:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleReject = (member) => {
    setSelectedMember(member);
    setRejectionNotes('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedMember || !rejectionNotes.trim()) return;

    try {
      const updateData = {
        firstName: selectedMember.firstName,
        lastName: selectedMember.lastName,
        email: selectedMember.email,
        memberStatus: "rejected",
        rejectionNotes: rejectionNotes,
        paymentStatus: selectedMember.paymentStatus
      };

      await updateMemberMutation.mutateAsync({
        url: `/members/${selectedMember._id}`,
        data: updateData
      });

      // Reset modal state after successful update
      setShowRejectModal(false);
      setSelectedMember(null);
      setRejectionNotes('');
      refetch();
    } catch (error) {
      console.error("Error rejecting member:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-text-color">Error loading data</div>;
  }

  const totalPages = memberData?.pagination?.totalPages || 1;
  const members = memberData?.members || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      paid: 'bg-green-500',
      unpaid: 'bg-red-500',
      refund: 'bg-orange-500',
      canceled: 'bg-gray-500'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-white text-xs ${statusColors[status] || 'bg-gray-500'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-secondary-card rounded-lg border border-border">
        <Select
          value={filters.applicationFor}
          onChange={(e) => handleFilterChange('applicationFor', e.target.value)}
          className="text-text-color"
        >
          <option value="">All Applications</option>
          <option value="single">Single</option>
          <option value="couple">Couple</option>
        </Select>

        <Select
          value={filters.paymentStatus}
          onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
          className="text-text-color"
        >
          <option value="">All Payment Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refund">Refund</option>
          <option value="canceled">Canceled</option>
        </Select>

        <Select
          value={filters.memberStatus}
          onChange={(e) => handleFilterChange('memberStatus', e.target.value)}
          className="text-text-color"
        >
          <option value="">All Member Status</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </Select>

        <Select
          value={filters.visaStatus}
          onChange={(e) => handleFilterChange('visaStatus', e.target.value)}
          className="text-text-color"
        >
          <option value="">All Visa Status</option>
          <option value="Permanent Resident">Permanent Resident</option>
          <option value="citizen">Citizen</option>
          <option value="job">Job</option>
          <option value="student">Student</option>
          <option value="others">Others</option>
        </Select>

        <TextInput
          placeholder="District"
          value={filters.district}
          onChange={(e) => handleFilterChange('district', e.target.value)}
          className="text-text-color"
        />

        <TextInput
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="text-text-color"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-96">
        <Table theme={{ dark: true }} className="border border-border rounded-lg">
          <Table.Head className="bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">ID</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Name</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Email</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Application Type</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Payment Status</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Member Status</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Visa Status</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">District</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Created Date</Table.HeadCell>
            <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-border">
            {members.map((member) => (
              <Table.Row key={member._id} className="border-gray-700 bg-secondary-card">
                <Table.Cell className="border-border whitespace-nowrap font-medium text-text-color">
                  {member.memberNumber}
                </Table.Cell>
                <Table.Cell className="border-border whitespace-nowrap font-medium text-text-color">
                  {member.firstName} {member.lastName}
                </Table.Cell>
                <Table.Cell className="border-border text-text-color">{member.email}</Table.Cell>
                <Table.Cell className="border-border text-text-color">
                  <span className="capitalize">{member.applicationFor}</span>
                </Table.Cell>
                <Table.Cell className="border-border text-text-color">
                  {getStatusBadge(member.paymentStatus)}
                </Table.Cell>
                <Table.Cell className="border-border text-text-color">
                  {getStatusBadge(member.memberStatus)}
                </Table.Cell>
                <Table.Cell className="border-border text-text-color">{member.visaStatus}</Table.Cell>
                <Table.Cell className="border-border text-text-color">{member.district}</Table.Cell>
                <Table.Cell className="border-border text-text-color">
                  {formatDate(member.createdAt)}
                </Table.Cell>
                <Table.Cell className="border-border text-text-color">
                  <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                    <Dropdown.Item onClick={() => handleViewForm(member)}>
                      View Form
                    </Dropdown.Item>
                    {member.memberStatus === 'pending' && (
                      <>
                        <Dropdown.Item
                          onClick={() => handleAccept(member)}
                          disabled={updateMemberMutation.isPending}
                        >
                          {updateMemberMutation.isPending ? 'Accepting...' : 'Accept'}
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleReject(member)}
                          disabled={updateMemberMutation.isPending}
                        >
                          {updateMemberMutation.isPending ? 'Processing...' : 'Reject'}
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === index + 1 ? "bg-primary-button-color" : "bg-gray-700"
              } text-btn-text-color`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* View Form Modal */}
      <Modal show={showViewModal} onClose={() => setShowViewModal(false)} size="4xl">
        <Modal.Header>Member Application Details</Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text-color">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color">First Name</label>
                    <p className="text-text-color">{selectedMember.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Last Name</label>
                    <p className="text-text-color">{selectedMember.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Email</label>
                    <p className="text-text-color">{selectedMember.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Date of Birth</label>
                    <p className="text-text-color">{formatDate(selectedMember.dob)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Mobile Number</label>
                    <p className="text-text-color">{selectedMember.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">WhatsApp Number</label>
                    <p className="text-text-color">{selectedMember.whatsappNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-color">Address</label>
                    <p className="text-text-color">{selectedMember.address}</p>
                  </div>
                </div>
              </div>

              {/* Partner Information (if couple application) */}
              {selectedMember.applicationFor === 'couple' && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-text-color">Partner Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color">Partner First Name</label>
                      <p className="text-text-color">{selectedMember.partnerFirstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color">Partner Last Name</label>
                      <p className="text-text-color">{selectedMember.partnerLastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color">Partner Email</label>
                      <p className="text-text-color">{selectedMember.partnerEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color">Partner DOB</label>
                      <p className="text-text-color">{formatDate(selectedMember.partnerDob)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text-color">Application Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color">Application Type</label>
                    <p className="text-text-color capitalize">{selectedMember.applicationFor}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Amount to be Paid</label>
                    <p className="text-text-color">${selectedMember.amountTobePaid}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Payment Status</label>
                    <p className="text-text-color">{getStatusBadge(selectedMember.paymentStatus)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Member Status</label>
                    <p className="text-text-color">{getStatusBadge(selectedMember.memberStatus)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Visa Status</label>
                    <p className="text-text-color">{selectedMember.visaStatus}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">District</label>
                    <p className="text-text-color">{selectedMember.district}</p>
                  </div>
                </div>
              </div>

              {/* Kerala Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text-color">Kerala Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-color">Address in Kerala</label>
                    <p className="text-text-color">{selectedMember.addressInKerala}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Assembly Name</label>
                    <p className="text-text-color">{selectedMember.assemblyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Emergency Contact (Kerala)</label>
                    <p className="text-text-color">{selectedMember.emergencyContactNameKerala}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Emergency Contact Number (Kerala)</label>
                    <p className="text-text-color">{selectedMember.emergencyContactNumberKerala}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text-color">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color">Emergency Contact Name</label>
                    <p className="text-text-color">{selectedMember.emergencyContactName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Emergency Contact Mobile</label>
                    <p className="text-text-color">{selectedMember.emergencyContactMobile}</p>
                  </div>
                </div>
              </div>

              {/* IUML Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text-color">IUML Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color">Contact Name</label>
                    <p className="text-text-color">{selectedMember.iuMLContactName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Contact Position</label>
                    <p className="text-text-color">{selectedMember.iuMLContactPosition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Contact Number</label>
                    <p className="text-text-color">{selectedMember.iuMLContactNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color">Location</label>
                    <p className="text-text-color">{selectedMember.iuMLLocation}</p>
                  </div>
                </div>
              </div>

              {/* Agreements */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text-color">Agreements</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-text-color">Support KMCC: </span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedMember.supportKMCC ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {selectedMember.supportKMCC ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-text-color">Read Bylaw: </span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedMember.readBylaw ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {selectedMember.readBylaw ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-text-color">Accept KMCC: </span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedMember.acceptKmcc ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {selectedMember.acceptKmcc ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-text-color">Share Info with Norka: </span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedMember.shareInfoNorka ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {selectedMember.shareInfoNorka ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection Notes (if rejected) */}
              {selectedMember.memberStatus === 'rejected' && selectedMember.rejectionNotes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-text-color">Rejection Notes</h3>
                  <p className="text-red-400 bg-red-100 p-3 rounded">{selectedMember.rejectionNotes}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <Modal.Header>Reject Member Application</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-text-color">
              Are you sure you want to reject the application for {selectedMember?.firstName} {selectedMember?.lastName}?
            </p>
            <div>
              <label className="block text-sm font-medium text-text-color mb-2">
                Rejection Notes (Required)
              </label>
              <Textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="failure"
            onClick={confirmReject}
            disabled={!rejectionNotes.trim() || updateMemberMutation.isPending}
          >
            {updateMemberMutation.isPending ? 'Rejecting...' : 'Reject Application'}
          </Button>
          <Button color="gray" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MembershipTable;