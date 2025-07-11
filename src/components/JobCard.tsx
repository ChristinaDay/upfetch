'use client'

import { Job } from '@/types/job'
import { 
  formatSalaryRange, 
  formatJobPostedDate, 
  formatJobLocation, 
  formatEmploymentType,
  truncateDescription,
  extractSkills,
  calculateJobMatchScore,
  getCompanyLogoUrl,
  capitalizeLocation
} from '@/utils/jobUtils'
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface JobCardProps {
  job: Job
  isSaved?: boolean
  onSave?: (jobId: string) => void
  onApply?: (job: Job) => void
  showMatchScore?: boolean
  className?: string
}

export default function JobCard({ 
  job, 
  isSaved = false, 
  onSave, 
  onApply,
  showMatchScore = true,
  className = '' 
}: JobCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const skills = extractSkills(job)
  const matchScore = calculateJobMatchScore(job)
  const companyLogoUrl = job.employer_logo || getCompanyLogoUrl(job.employer_name, job.employer_website)

  const handleSave = () => {
    if (onSave) {
      onSave(job.job_id)
    }
  }

  const handleApply = () => {
    if (onApply) {
      onApply(job)
    } else {
      window.open(job.job_apply_link, '_blank')
    }
  }

  return (
    <Card className={`rounded-2xl border-4 border-primary shadow-xl overflow-hidden bg-card h-full flex flex-col ${className}`}>
      {/* Top Holo Bar */}
      <div className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 px-4 py-2 flex items-center justify-between">
        {/* Match Score Badge (like HP) */}
        {showMatchScore ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold px-3 py-1 text-base shadow-sm">
            <SparklesIcon className="w-4 h-4 mr-1" />
            {matchScore}% Match
          </Badge>
        ) : <div />}
        {/* Save Button (star/ribbon style) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="text-yellow-500 hover:text-yellow-600 p-2 rounded-full border-2 border-yellow-300 bg-white/80 shadow-md"
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
        >
          {isSaved ? (
            <BookmarkSolidIcon className="w-6 h-6 text-primary" />
          ) : (
            <BookmarkIcon className="w-6 h-6" />
          )}
        </Button>
      </div>
      <CardContent className="pt-0 pb-4 px-6 flex flex-col flex-1 mt-8">
        {/* Logo + Title Row */}
        <div className="flex items-center gap-4 mb-2">
          {/* Employer Logo (square thumbnail) */}
          <div className="w-14 h-14 rounded-lg bg-white shadow border flex items-center justify-center overflow-hidden flex-shrink-0">
            {!imageError ? (
              <Image
                src={companyLogoUrl}
                alt={`${job.employer_name} logo`}
                width={56}
                height={56}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <BriefcaseIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          {/* Title & Employer */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-foreground mb-1 line-clamp-2">
              {job.job_title}
            </h3>
            <p className="text-base text-muted-foreground font-medium mb-0 line-clamp-1">
              {job.employer_name}
            </p>
          </div>
        </div>
        {/* Meta Row (stat boxes) */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-muted/70 rounded-full px-3 py-1 text-sm">
            <MapPinIcon className="h-4 w-4" />
            <span className="font-medium">
              {job.job_city && job.job_state ? capitalizeLocation(`${job.job_city}, ${job.job_state}`) :
                job.job_city ? capitalizeLocation(job.job_city) :
                job.job_country || 'Location not specified'}
            </span>
          </div>
          {job.job_employment_type && (
            <div className="flex items-center gap-1 bg-muted/70 rounded-full px-3 py-1 text-sm">
              <BriefcaseIcon className="h-4 w-4" />
              <span>{job.job_employment_type}</span>
            </div>
          )}
          {job.job_is_remote && (
            <div className="flex items-center gap-1 bg-green-100 rounded-full px-3 py-1 text-sm text-green-700">
              <ComputerDesktopIcon className="h-4 w-4" />
              Remote
            </div>
          )}
        </div>
        {/* Description (flavor text) */}
        <div className="bg-muted/60 rounded-lg p-3 italic text-center text-sm mb-3 w-full">
          {truncateDescription(job.job_description, 200)}
        </div>
      </CardContent>
      {/* Footer: Salary, Badges, Apply button and info */}
      <div className="px-6 pb-4 mt-auto">
        {/* Salary */}
        {(job.job_min_salary || job.job_max_salary) && (
          <div className="flex items-center justify-center bg-emerald-900/40 ring-2 ring-emerald-400/60 rounded-full px-3 py-1 shadow-lg mb-4">
            <CurrencyDollarIcon className="w-5 h-5 text-emerald-300 dark:text-emerald-400 mr-2 drop-shadow-lg" />
            <span className="text-emerald-200 dark:text-emerald-300 font-extrabold text-lg tracking-wide drop-shadow-lg">
              {formatSalaryRange(job.job_min_salary, job.job_max_salary, job.job_salary_currency, job.job_salary_period)}
            </span>
          </div>
        )}
        {/* Skills & Benefits (energy/abilities) */}
        {(skills.length > 0 || (job.job_benefits && job.job_benefits.length > 0)) && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 px-2 py-1 text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 6 && (
              <Badge variant="outline" className="text-muted-foreground px-2 py-1 text-xs">
                +{skills.length - 6} more
              </Badge>
            )}
            {job.job_benefits && job.job_benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 px-2 py-1 text-xs">
                {benefit}
              </Badge>
            ))}
            {job.job_benefits && job.job_benefits.length > 3 && (
              <Badge variant="outline" className="text-muted-foreground px-2 py-1 text-xs">
                +{job.job_benefits.length - 3} benefits
              </Badge>
            )}
          </div>
        )}
        <Button onClick={handleApply} className="w-full font-bold text-lg flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary">
          Apply Now
          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
        </Button>
        <div className="text-xs text-muted-foreground text-center mt-2">
          <ClockIcon className="inline-block w-4 h-4 mr-1 align-text-bottom" />
          {formatJobPostedDate(job.job_posted_at_datetime_utc)}
          <span className="mx-1">•</span>
          via {job.job_publisher}
        </div>
      </div>
    </Card>
  )
} 