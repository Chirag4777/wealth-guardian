import React from 'react';
import { Layout } from '../components/ui/Layout';

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About Wealth Guardian
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Transforming digital finance with secure, fast, and reliable digital wallet solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  Founded in 2023, Wealth Guardian was born from a simple yet powerful vision: to make digital financial transactions secure, seamless, and accessible to everyone.
                </p>
                <p>
                  Our founders recognized the challenges people faced with traditional banking systems - high fees, slow transfers, and complex interfaces. They set out to build a solution that would empower users to manage their money with confidence and ease.
                </p>
                <p>
                  Today, Wealth Guardian serves thousands of users worldwide, providing a trusted platform for digital wallet services and instant money transfers between users.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-8 relative">
                <div className="absolute -top-6 -right-6 h-12 w-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  To build the most trusted digital wallet platform that empowers individuals and businesses to manage their finances securely and efficiently.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">Our Vision</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  A world where financial services are accessible, secure, and seamless for everyone, everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              These principles guide everything we do at Wealth Guardian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Security First
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We prioritize the security of your funds and personal information above everything else, using industry-leading encryption and authentication methods.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Transparency
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in clear, honest communication with our users, including transparent fees and straightforward terms of service.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We continuously strive to improve our platform, embracing new technologies and ideas to deliver the best possible digital wallet experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              The talented people behind Wealth Guardian's success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg className="h-32 w-32 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jasmine Chen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">CEO & Co-Founder</p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg className="h-32 w-32 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marcus Johnson</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">CTO & Co-Founder</p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg className="h-32 w-32 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Olivia Rodriguez</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">CFO</p>
            </div>

            {/* Team Member 4 */}
            <div className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg className="h-32 w-32 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">David Patel</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Head of Customer Experience</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage; 