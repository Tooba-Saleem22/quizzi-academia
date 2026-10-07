import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

const collegeColors = {
  primary: '#003366',
  secondary: '#0055A4',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  lightGrey: '#e1e8f0',
  darkGrey: '#444'
};

const PaymentVerificationsPage = () => {
  const [paymentVerifications, setPaymentVerifications] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPaymentVerifications = async () => {
      try {
        const res = await axios.get('/api/payments/admin/verifications');
        setPaymentVerifications(res.data.data || []);
      } catch (err) {
        console.error('Error fetching payment verifications:', err);
      }
    };
    fetchPaymentVerifications();
  }, []);

  const handlePaymentAction = async (id, status, adminNotes = '') => {
    setProcessingPayment(id);
    try {
      const res = await axios.patch(`/api/payments/admin/verify/${id}`, {
        status,
        adminNotes
      });

      if (res.data.success) {
        setPaymentVerifications(prev =>
          prev.map(v =>
            v._id === id
              ? { ...v, status, adminNotes, processedAt: new Date() }
              : v
          )
        );
        alert(`✅ Payment ${status} successfully!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const openReceiptModal = (path, name) => {
    setSelectedReceipt({ path, name });
  };

  const closeReceiptModal = () => {
    setSelectedReceipt(null);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  const getStatusBadge = (status) => {
    const badgeColors = {
      approved: '#28a745',
      rejected: '#dc3545',
      pending: '#ffc107'
    };
    return {
      backgroundColor: badgeColors[status] || '#ccc',
      color: status === 'pending' ? '#000' : '#fff',
      padding: '4px 10px',
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 13,
      textTransform: 'capitalize'
    };
  };

  const filteredVerifications = paymentVerifications.filter(v =>
    v.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.userPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <main style={{ padding: 30 }}>
        <div style={{ marginBottom: 20, maxWidth: 400, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by name, email, phone or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              paddingLeft: 32,
              borderRadius: 6,
              border: `1.5px solid ${collegeColors.lightGrey}`,
              outline: 'none',
              fontSize: 16,
              transition: 'border-color 0.3s',
            }}
            onFocus={e => e.target.style.borderColor = collegeColors.accent}
            onBlur={e => e.target.style.borderColor = collegeColors.lightGrey}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18" height="18"
            fill={collegeColors.secondary}
            viewBox="0 0 24 24"
            style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)' }}
          >
            <path d="M21.707 20.293l-5.387-5.386A7.928 7.928 0 0018 10a8 8 0 10-8 8 7.928 7.928 0 004.907-1.68l5.386 5.387a1 1 0 001.414-1.414zM4 10a6 6 0 1112 0 6 6 0 01-12 0z" />
          </svg>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 0 15px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead style={{ backgroundColor: collegeColors.secondary, color: collegeColors.white }}>
              <tr>
                {['User', 'Phone', 'Transaction', 'Amount', 'Status', 'Submitted', 'Receipt', 'Actions'].map(header => (
                  <th key={header} style={{ padding: '12px 15px', textAlign: 'left' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVerifications.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#777' }}>No payment records found.</td>
                </tr>
              ) : filteredVerifications.map((v, i) => (
                <tr
                  key={v._id}
                  style={{
                    backgroundColor: i % 2 === 0 ? collegeColors.white : '#f9fbff',
                    transition: 'background 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = collegeColors.lightGrey}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? collegeColors.white : '#f9fbff'}
                >
                  <td style={{ padding: '10px 15px' }}>
                    <strong>{v.userName}</strong><br />
                    <small style={{ color: '#555' }}>{v.userEmail}</small>
                  </td>
                  <td style={{ padding: '10px 15px' }}>{v.userPhone}</td>
                  <td style={{ padding: '10px 15px' }}>{v.transactionId}</td>
                  <td style={{ padding: '10px 15px' }}>PKR {v.paymentAmount}</td>
                  <td style={{ padding: '10px 15px' }}>
                    <span style={getStatusBadge(v.status)}>{v.status}</span>
                  </td>
                  <td style={{ padding: '10px 15px' }}>{formatDate(v.submittedAt)}</td>
                  <td style={{ padding: '10px 15px' }}>
                    <button
                      onClick={() => openReceiptModal(v.receiptPath, v.receiptOriginalName)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: collegeColors.secondary,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: 14,
                      }}
                    >
                      View
                    </button>
                  </td>
                  <td style={{ padding: '10px 15px' }}>
                    {v.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handlePaymentAction(v._id, 'approved')}
                          disabled={processingPayment === v._id}
                          style={{
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            marginRight: 5,
                            borderRadius: 5,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for rejection?');
                            if (reason !== null) handlePaymentAction(v._id, 'rejected', reason);
                          }}
                          disabled={processingPayment === v._id}
                          style={{
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: 5,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <small>{formatDate(v.processedAt)}</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedReceipt && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={closeReceiptModal}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Receipt</h5>
                  <button type="button" className="btn-close" onClick={closeReceiptModal}></button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={`/api/payment/receipt/${selectedReceipt.path?.split('/').pop()}`}
                    alt="Receipt"
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  />
                  <p className="mt-2"><small>{selectedReceipt.name}</small></p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn"
                    style={{
                      backgroundColor: collegeColors.accent,
                      color: collegeColors.primary,
                      fontWeight: 'bold',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 6,
                    }}
                    onClick={closeReceiptModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default PaymentVerificationsPage;
