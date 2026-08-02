import React from 'react'
import { Card, Progress, Timeline, Tag, Tabs } from 'antd'
import { FieldTimeOutlined, SafetyCertificateOutlined, TrophyOutlined } from '@ant-design/icons'
import PatientExercises from './PatientExercises'

export default function PatientTreatmentPlans() {
  const treatmentPlans = [
    {
      condition: 'Chronic Lumbar Spinal Strain & Discogenic Lower Back Pain',
      practitioner: 'Dr. Sarah Jenkins (Physiotherapist)',
      stage: 'Phase 2: Lumbar Mobilisation & Spinal Stabilization',
      overallProgress: 65,
      goals: [
        { title: 'Walk Pain Free (distance > 2km)', percent: 70, status: 'Active' },
        { title: 'Return To Work (lift limits up to 15kg)', percent: 50, status: 'Active' },
        { title: 'Improve Core Stability (plank hold > 60s)', percent: 80, status: 'Active' }
      ],
      timeline: [
        { label: 'Initial Assessment & Intake', date: '02 Jan 2026', desc: 'Baseline lumbar ROM mapped. NDIS funding plan registered.', status: 'Completed' },
        { label: 'Phase 1: Acute Relief & Stretching', date: '25 Feb 2026', desc: 'Lumbar stretching extensions. Focus on reducing acute nerve inflammation.', status: 'Completed' },
        { label: 'Progress Review & Exercise Routine update', date: '18 May 2026', desc: 'Marked calf raises and ankle eccentric stretching adjustments.', status: 'Completed' },
        { label: 'Phase 2: Stabilization & Core Loading', date: 'Current Phase', desc: 'Cat-Cow mobility, dead bug holds, and spinal loading drills.', status: 'Active' },
        { label: 'Milestone: Functional Capacity Evaluation', date: 'Expected: 22 Jul 2026', desc: 'Comprehensive NDIS goal compliance checks and clinical reporting.', status: 'Pending' },
        { label: 'Discharge Target', date: 'Expected: 30 Aug 2026', desc: 'Self-management care transition program.', status: 'Pending' }
      ]
    }
  ]

  const getTimelineColor = (status) => {
    switch (status) {
      case 'Completed': return 'green'
      case 'Active': return 'blue'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      <Tabs 
        defaultActiveKey="programs"
        className="[&_.ant-tabs-nav]:mb-6"
        items={[
          {
            key: 'programs',
            label: <span className="font-bold">Active Programs</span>,
            children: (
              <div className="space-y-6">
                {/* Intro Header */}
                <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-808 dark:text-white m-0">My Clinical Treatment Programs</h2>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
                        Track active rehabilitation plan stages, shared clinical targets, and care program milestones.
                      </p>
                    </div>
                    <Tag color="purple" className="rounded-full border-none font-bold text-[10px] px-3.5 py-1 uppercase">
                      <TrophyOutlined className="mr-1" />
                      Active Care Plan
                    </Tag>
                  </div>
                </Card>

                {treatmentPlans.map((plan, idx) => (
                  <div key={idx} className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginTop: '24px' }}>
                    
                    {/* Active Treatment Card and Goals list */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Treatment plan summary */}
                      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Assigned Condition / Program</span>
                            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm m-0 mt-0.5">{plan.condition}</h3>
                            <span className="text-slate-450 dark:text-slate-400 text-xs block mt-1 font-semibold">Directed by: {plan.practitioner}</span>
                          </div>

                          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Current Active Stage</span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold text-xs">{plan.stage}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-2">Overall Program Progress</span>
                            <div className="flex items-center gap-3">
                              <Progress percent={plan.overallProgress} strokeColor="#8C4BFF" className="flex-1 m-0" />
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Goal Tracking Indicators */}
                      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" style={{ marginTop: '24px' }} title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">Goal Tracking & Adherence Indicators</span>}>
                        <div className="space-y-5">
                          {plan.goals.map((g, gIdx) => (
                            <div key={gIdx} className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                                <span>{g.title}</span>
                                <span className="text-[#8C4BFF]">{g.percent}% Complete</span>
                              </div>
                              <Progress percent={g.percent} size="small" strokeColor={{ '0%': '#30D2BE', '100%': '#8C4BFF' }} showInfo={false} />
                            </div>
                          ))}
                        </div>
                      </Card>

                    </div>

                    {/* Treatment timeline milestones */}
                    <div className="lg:col-span-1">
                      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900 h-full" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">Care Program Milestones & Timeline</span>}>
                        <Timeline className="mt-3">
                          {plan.timeline.map((item, tIdx) => (
                            <Timeline.Item key={tIdx} color={getTimelineColor(item.status)}>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.label}</span>
                                  {item.status === 'Active' && <Tag color="blue" className="rounded-full text-[8px] font-bold border-none px-2 py-0.2 uppercase m-0">Active</Tag>}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block"><FieldTimeOutlined className="mr-1" />{item.date}</span>
                                <p className="text-slate-655 dark:text-slate-400 text-xs mt-1 mb-0 italic">{item.desc}</p>
                              </div>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </Card>
                    </div>

                  </div>
                ))}
              </div>
            )
          },
          {
            key: 'exercises',
            label: <span className="font-bold">Prescribed Exercises</span>,
            children: <PatientExercises />
          }
        ]}
      />
    </div>
  )
}
