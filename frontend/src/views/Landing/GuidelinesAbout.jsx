import React from 'react';
import { BookOpen, Lock, FileCheck, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';

export default function GuidelinesAbout() {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-white pt-32 pb-24">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-semibold text-slate-900 mb-3">
              Guidelines & About
            </h1>
            <p className="text-slate-600">
              Learn about our guidelines, policies, access, and submission guidelines
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
          
          {/* About the System Section */}
          <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">About the System</h2>
            </div>

            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                The University Research Repository is a comprehensive digital archive designed to preserve, manage, and provide worldwide access to academic research and scholarship produced by students, faculty, and researchers at our institution.
              </p>
              <p>
                Our repository provides a platform to showcase the excellent research produced at our university. By digitizing student theses, faculty publications, and research materials, we aim to make our institution's research output widely accessible to the global academic community.
              </p>

              <div className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-3">Key Features:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Advanced search and filtering capabilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Digital preservation of academic works</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Open-access support to increase visibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Secure and compliant data storage</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Metadata standards for discoverability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Integration with academic databases and search engines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Robust document management and version control</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Access and Visibility Rules Section */}
          <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-xl">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Access and Visibility Rules</h2>
            </div>

            <div className="space-y-6 text-slate-700">
              <div className="bg-green-50 py-4 px-6 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Full Access (Open Academic Requests)</h3>
                <p className=" text-sm leading-relaxed">
                  Open-type research and capstone projects are available to all users regardless of their role (e.g., researchers, students, faculty). Users can download, view and read the full document. You also can track its statistics, and citations/views.
                </p>
              </div>

              <div className="bg-orange-50 py-4 px-6 border border-orange-200 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2">Limited Access (Riks Academic Password)</h3>
                <p className=" text-sm leading-relaxed">
                  Closed research or data from Riks is not publicly full-text available. This protects intellectual property and prevents unauthorized use of research content, ensuring that only authorized researchers or stakeholders can access sensitive academic data.
                </p>
              </div>

              <div className="bg-blue-50 py-4 px-6 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Request Access</h3>
                <p className=" text-sm leading-relaxed">
                  Users may request access to restricted research works through our online platform. Requests are reviewed by the department head and research adviser, and you may be granted full access to the research, subject to approval based on academic or research needs.
                </p>
              </div>

              <div className="py-4 px-6 ">
                <h3 className="font-semibold mb-2">Role-Based Permissions</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex items-start gap-2 text-sm ">
                    <span className="min-w-[140px]">Student's Access:</span>
                    <span>Can access or repository, download public research, and submit their documents research output.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm ">
                    <span className="min-w-[140px]">Department Heads:</span>
                    <span>Can manage academic programs, review submissions, and approve or deny department-level research.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Submission Guidelines Section */}
          <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-xl">
                <FileCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Submission Guidelines</h2>
            </div>

            <div className="space-y-4 text-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Eligibility</h3>
                <p className="leading-relaxed">
                  All students are eligible and encouraged to submit student theses that have finished signed by the research advisers for eligibility for publication in the repository.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">File Format and Size Requirements:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Acceptable research given in PDF format (standard format)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Maximum 20MB per file</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Documents must include the title page, abstract, and bibliography</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Ensure approval from advisor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Files must be searchable (not scanned images)</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Image file (official university format/LOGO or Acta finalis)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Clearly title authors and programs being researched in the metadata</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>All authors must be credited with full name and affiliation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Proof of signature or email and SignatureLock are properly labelled</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Academic Integrity and Copyright Notice Section */}
          <section className="bg-red-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Academic Integrity and Copyright Notice</h2>
            </div>

            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                All research submitted to the repository must comply with the university's policies on academic integrity. Plagiarism, falsification of data, and the misuse of information sources are strictly prohibited. Any violation of these rules will be taken very seriously and may result in student or academic personnel removal.
              </p>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Authors must ensure that:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span><strong>Plagiarism:</strong> Detecting performs scans on new work.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span><strong>Copyright and Licensing:</strong> By submitting work to our repository, authors grant the university a non-exclusive license to preserve, host, and make the research available to users. The author retains the copyright of the work while allowing others to access it as permitted.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span><strong>Data Privacy:</strong> Please note that all authors and student data is confidential and will only be used for academic and research purposes.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-2">Consequences of Violations</h3>
                <p>
                  Violations of plagiarism or copyright rules may result of revoking a public, including suspension of website access, possible sanctions, or final penalty at the university's discretion.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-2">Reporting Violations</h3>
                <p>
                  If you observe or encounter copyright or academic integrity issues related from the repository, feel free to email us at{' '}
                  <a href="mailto:integrity@university.edu" className="text-blue-600 hover:underline">
                    integrity@university.edu
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </>
  );
}