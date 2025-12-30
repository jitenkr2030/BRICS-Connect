'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Award, CheckCircle, AlertCircle, Download, Share2, Eye } from 'lucide-react';

interface Certificate {
  id: string;
  certificateNumber: string;
  certificateType: 'COMPLETION' | 'ACHIEVEMENT' | 'PROFESSIONAL';
  issueDate: string;
  expiryDate?: string;
  verificationCode: string;
  isVerified: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    title: string;
    level: string;
    duration: number;
    keyTopics: string[];
  };
  metadata?: {
    score?: number;
    grade?: string;
    specializations?: string[];
    issuerNotes?: string;
  };
}

interface CertificateVerification {
  valid: boolean;
  certificate?: Certificate;
  verificationDetails?: {
    completionPercentage: number;
    totalChapters: number;
    completedChapters: number;
    verificationTimestamp: string;
  };
}

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateVerification | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState('');
  const [certificateType, setCertificateType] = useState<'COMPLETION' | 'ACHIEVEMENT' | 'PROFESSIONAL'>('COMPLETION');
  const [issuerNotes, setIssuerNotes] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, [searchTerm, filterType]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);
      
      const response = await fetch(`/api/certificates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async () => {
    if (!verificationCode) return;
    
    try {
      setVerifying(true);
      const response = await fetch(`/api/certificates/verify?code=${verificationCode}`);
      const data = await response.json();
      
      if (response.ok) {
        setVerificationResult(data);
      } else {
        setVerificationResult({ valid: false });
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({ valid: false });
    } finally {
      setVerifying(false);
    }
  };

  const issueCertificate = async () => {
    if (!selectedEnrollment) return;
    
    try {
      setIssuingCertificate(true);
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment,
          certificateType,
          metadata: {
            issuerNotes,
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Certificate issued successfully!');
          setSelectedEnrollment('');
          setIssuerNotes('');
          fetchCertificates();
        }
      }
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Failed to issue certificate');
    } finally {
      setIssuingCertificate(false);
    }
  };

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'COMPLETION': return 'bg-green-100 text-green-800';
      case 'ACHIEVEMENT': return 'bg-blue-100 text-blue-800';
      case 'PROFESSIONAL': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'COMPLETION': return 'Completion';
      case 'ACHIEVEMENT': return 'Achievement';
      case 'PROFESSIONAL': return 'Professional';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Certificate Management</h1>
        <Badge variant="outline" className="text-lg">
          {certificates.length} Certificates
        </Badge>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Certificates</TabsTrigger>
          <TabsTrigger value="verify">Verify Certificate</TabsTrigger>
          <TabsTrigger value="issue">Issue Certificate</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, email, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="filter">Certificate Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="COMPLETION">Completion</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-8">
                Loading certificates...
              </div>
            ) : certificates.length === 0 ? (
              <div className="col-span-full text-center py-8">
                No certificates found.
              </div>
            ) : (
              certificates.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getCertificateTypeColor(certificate.certificateType)}>
                        {getCertificateTypeLabel(certificate.certificateType)}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{certificate.course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><strong>Student:</strong> {certificate.user.firstName} {certificate.user.lastName}</p>
                      <p><strong>Email:</strong> {certificate.user.email}</p>
                      <p><strong>Course Level:</strong> {certificate.course.level}</p>
                      <p><strong>Duration:</strong> {certificate.course.duration} hours</p>
                      <p><strong>Issued:</strong> {new Date(certificate.issueDate).toLocaleDateString()}</p>
                    </div>
                    
                    {certificate.metadata && (
                      <div className="space-y-1">
                        {certificate.metadata.score && (
                          <p><strong>Score:</strong> {certificate.metadata.score}%</p>
                        )}
                        {certificate.metadata.grade && (
                          <p><strong>Grade:</strong> {certificate.metadata.grade}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified Certificate</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Verify Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="verification-code"
                    placeholder="Enter verification code..."
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <Button onClick={verifyCertificate} disabled={verifying || !verificationCode}>
                    {verifying ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <Alert className={verificationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {verificationResult.valid ? (
                      <div className="space-y-2">
                        <p className="font-medium text-green-800">Certificate is valid!</p>
                        {verificationResult.certificate && (
                          <div className="text-sm text-green-700">
                            <p><strong>Student:</strong> {verificationResult.certificate.user.firstName} {verificationResult.certificate.user.lastName}</p>
                            <p><strong>Course:</strong> {verificationResult.certificate.course.title}</p>
                            <p><strong>Type:</strong> {getCertificateTypeLabel(verificationResult.certificate.certificateType)}</p>
                            {verificationResult.verificationDetails && (
                              <p><strong>Completion:</strong> {verificationResult.verificationDetails.completionPercentage.toFixed(1)}%</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium text-red-800">Certificate not found or invalid</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Certificate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="enrollment">Select Enrollment</Label>
                <Select value={selectedEnrollment} onValueChange={setSelectedEnrollment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select completed enrollment..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enrollment-1">BRICS for Normal People - John Doe</SelectItem>
                    <SelectItem value="enrollment-2">BRICS Business Basics - Jane Smith</SelectItem>
                    <SelectItem value="enrollment-3">How Money Moves in BRICS - Bob Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate-type">Certificate Type</Label>
                <Select value={certificateType} onValueChange={(value: any) => setCertificateType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETION">Completion Certificate</SelectItem>
                    <SelectItem value="ACHIEVEMENT">Achievement Certificate</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer-notes">Issuer Notes (Optional)</Label>
                <Textarea
                  id="issuer-notes"
                  placeholder="Add any notes about this certificate..."
                  value={issuerNotes}
                  onChange={(e) => setIssuerNotes(e.target.value)}
                />
              </div>

              <Button 
                onClick={issueCertificate} 
                disabled={issuingCertificate || !selectedEnrollment}
                className="w-full"
              >
                {issuingCertificate ? 'Issuing Certificate...' : 'Issue Certificate'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}