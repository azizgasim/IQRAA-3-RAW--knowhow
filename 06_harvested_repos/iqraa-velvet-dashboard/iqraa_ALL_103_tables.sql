-- ======================================================================
-- مشروع إقرأ 12 - جميع الجداول (103 جدول)
-- المصدر: جلسة 4 مع Gemini
-- التاريخ: 2025-11-28
-- ======================================================================


-- ════════════════════════════════════════════════════════════════════
-- [001] agent_behavioral_rules
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.agent_behavioral_rules ( rule_id STRING NOT NULL, -- Agent Type agent_type STRING, -- scholar/ruler/institution/mob/market -- Decision Context decision_context STRUCT context_name STRING, -- career_choice/political_stance/intellectual_position -- State Variables (what the agent "sees") state_variables ARRAY<STRUCT variable_name STRING, -- patron_support/persecution_risk/economic_security variable_type STRING, -- continuous/discrete/binary current_value_range STRING >>, -- Possible Actions possible_actions ARRAY<STRING> -- write_book/migrate/conform/resist/innovate >, -- Decision Rule (🔥 THE CORE!) decision_rule STRUCT rule_type STRING, -- probabilistic/deterministic/threshold/optimization -- IF-THEN Logic condition_action_pairs ARRAY<STRUCT condition STRING, -- "persecution_risk > 0.7 AND economic_security < 0.3" action STRING, probability FLOAT64, -- if probabilistic -- Utility calculation utility_function STRING, -- mathematical expression -- Parameters (calibrated from historical data) parameters JSON >>, -- Stochasticity noise_level FLOAT64, -- 0-1, how much randomness? -- Learning/Adaptation is_adaptive BOOLEAN, adaptation_rule STRING -- "if action fails 3x, switch strategy" >, -- Calibration calibration STRUCT calibrated_from ARRAY<STRUCT historical_case_id STRING, -- FK → scholars/rulers/events case_description STRING, fit_quality FLOAT64 -- how well does rule match historical behavior? >>, validation_cases ARRAY<STRING>, -- holdout cases for testing -- Statistical Fit goodness_of_fit STRUCT r_squared FLOAT64, prediction_accuracy FLOAT64, confidence_interval STRING >> >, -- Context Dependencies contextual_modifiers ARRAY<STRUCT modifier_type STRING, -- cultural/temporal/spatial modifier_value STRING, effect_on_rule STRING -- how does it modify the rule? >>, metadata STRUCT created_at TIMESTAMP, evidence_base STRING, confidence_level STRING >)CLUSTER BY agent_type, decision_context.context_name;


-- ════════════════════════════════════════════════════════════════════
-- [002] alternative_trajectories_counterfactuals
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.alternative_trajectories_counterfactuals ( scenario_id STRING NOT NULL, -- نقطة التشعب divergence_point STRUCT divergence_date DATE, divergence_century_hijri STRING, -- الحدث الفعلي actual_event STRUCT event_id STRING, -- FK → comprehensive_timeline_events event_description STRING >>, -- البديل الممكن counterfactual_event STRUCT alternative_description STRING, plausibility STRING, -- highly_plausible/plausible/speculative -- لماذا لم يحدث؟ why_didnt_happen ARRAY<STRUCT reason_type STRING, -- contingent/structural/intentional reason_description STRING >> >> >, -- السيناريو البديل alternative_scenario STRUCT scenario_name STRING, scenario_description STRING, -- المنطق logical_chain ARRAY<STRUCT step_number INT64, step_description STRING, probability_assessment STRING, -- الافتراضات assumptions ARRAY<STRING> >>, -- الاحتمالية الإجمالية overall_plausibility STRUCT plausibility_score FLOAT64, -- 0-100 assessment_rationale STRING, -- العوامل supporting_factors ARRAY<STRING>, opposing_factors ARRAY<STRING> >> >, -- النتائج المحتملة projected_outcomes STRUCT short_term ARRAY<STRUCT domain STRING, projected_change STRING, confidence STRING >>, medium_term ARRAY<STRUCT domain STRING, projected_change STRING, confidence STRING >>, long_term ARRAY<STRUCT domain STRING, projected_change STRING, confidence STRING >> >, -- التأثير على المسار الفكري intellectual_trajectory_impact STRUCT -- الأفكار التي قد تظهر enabled_ideas ARRAY<STRUCT idea_description STRING, likelihood STRING, potential_impact STRING >>, -- الأفكار التي قد تختفي suppressed_ideas ARRAY<STRUCT idea_description STRING, likelihood STRING >>, -- المدارس المتأثرة affected_schools ARRAY<STRUCT school_id STRING, projected_fate STRING -- flourish/decline/transform >> >, -- المقارنة مع ما حدث فعلاً actual_vs_counterfactual STRUCT key_differences ARRAY<STRUCT dimension STRING, actual STRING, counterfactual STRING, significance STRING >>, -- الدروس insights_gained ARRAY<STRING> >, -- الأدلة الداعمة supporting_evidence STRUCT -- أمثلة مماثلة analogous_cases ARRAY<STRUCT case_description STRING, similarity STRING, outcome STRING >>, -- محاكاة simulation_results STRUCT simulation_method STRING, simulation_outcome STRING, confidence STRING >> >, -- القيمة التفسيرية explanatory_value STRUCT -- ماذا يوضح هذا السيناريو؟ clarifies ARRAY<STRING>, -- الحتميات الزائفة debunked_inevitabilities ARRAY<STRING>, -- القوى الفاعلة المكتشفة revealed_forces ARRAY<STRING> >, metadata STRUCT scenario_author STRING, peer_review_status STRING, criticism ARRAY<STRING>, revision_history JSON >)CLUSTER BY divergence_point.divergence_century_hijri, alternative_scenario.overall_plausibility.plausibility_score DESC;


-- ════════════════════════════════════════════════════════════════════
-- [003] argumentation_methods_and_logic
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.argumentation_methods_and_logic` (
    method_id STRING, method_name STRING, logic_type STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [004] arts_architecture_and_aesthetics
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.arts_architecture_and_aesthetics`
(
    artifact_id STRING OPTIONS(description="معرف فريد للمعلم أو الأثر"),
    name_ar STRING NOT NULL,
    name_en STRING,
    
    -- التصنيف الأساسي (لأغراض الفلترة السريعة)
    category STRING OPTIONS(description="Architecture, Calligraphy, Music, Applied Arts"),
    subcategory STRING, 
    
    -- الحقل الزمني للتقسيم (Partitioning Key)
    creation_year INT64 OPTIONS(description="سنة الإنشاء أو الظهور التقريبية"),
    
    -- الموقع الجغرافي
    location_geo GEOGRAPHY OPTIONS(description="إحداثيات دقيقة للمكان"),
    location_details STRUCT<
        city STRING,
        region STRING,
        modern_country STRING
    >,

    -- الرعاية والسلطة (من الذي دفع؟ ولمن؟)
    patronage_info STRUCT<
        patron_name STRING,
        patron_role STRING OPTIONS(description="Sultan, Vizier, Merchant, Wife of Ruler"),
        political_affiliation STRING,
        dedication_text STRING OPTIONS(description="النص المذكور في الإهداء إن وجد")
    >,

    -- التحليل المعماري والجمالي
    aesthetic_analysis STRUCT<
        style_school STRING OPTIONS(description="Mamluk, Ottoman, Abbasid, Andalusian"),
        materials_used ARRAY<STRING>,
        architect_name STRING,
        key_features ARRAY<STRING> OPTIONS(description="Dome, Muqarnas, Iwan")
    >,

    -- النقوش (هام جداً للتحليل النصي)
    epigraphy_content STRUCT<
        full_inscription_text STRING,
        script_style STRING OPTIONS(description="Kufic, Thuluth, Naskh"),
        quranic_verses_cited ARRAY<STRING>,
        political_message STRING OPTIONS(description="تحليل الرسالة السياسية خلف النقش")
    >,

    -- الوظيفة الاجتماعية
    social_function STRUCT<
        original_function STRING OPTIONS(description="Mosque, Madrasa, Bimaristan, Palace"),
        is_waqf_supported BOOL,
        access_level STRING OPTIONS(description="Public, Elite Only, Restricted")
    >
)
PARTITION BY RANGE_BUCKET(creation_year, GENERATE_ARRAY(0, 1500, 50))
CLUSTER BY category, location_details.city;


-- ════════════════════════════════════════════════════════════════════
-- [005] author_profiles_master
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.author_profiles_master` (
    scholar_id STRING, 
    scholar_name STRING, 
    death_year INT64, 
    madhhab STRING, -- Cluster Key
    sources_of_income ARRAY<STRING>, -- (Trade, State_Salary, Waqf...)
    teachers ARRAY<STRING>,
    students ARRAY<STRING>
) PARTITION BY RANGE_BUCKET(death_year, GENERATE_ARRAY(0, 1500, 50)) CLUSTER BY madhhab;


-- ════════════════════════════════════════════════════════════════════
-- [006] bias_adjudication_log
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.bias_adjudication_log`
(
    adjudication_id STRING,
    detection_time TIMESTAMP,
    
    -- المصدر المشبوه
    source_ref STRUCT<
        book_title STRING,
        author_name STRING,
        passage_text STRING
    >,
    
    -- لائحة الاتهام (ماذا وجد الـ AI؟)
    accusation_details STRUCT<
        bias_type STRING, -- Orientalism, Materialism, Sectarian_Extremism
        confidence_score FLOAT64, -- نسبة الشك (مثلاً 85%)
        flagged_keywords ARRAY<STRING>, -- الكلمات التي أثارت الشك
        ai_reasoning STRING -- لماذا يعتقد الذكاء الاصطناعي أن هذا تحيز؟
    >,
    
    -- حكم المحكم (الإنسان أو نموذج أعلى)
    verdict STRUCT<
        final_judgment STRING, -- Confirmed_Bias, False_Positive, Safe_Context
        reviewer_notes STRING,
        action_taken STRING -- Tag_as_Biased, Exclude_from_Analysis, Approve
    >
)
PARTITION BY DATE(detection_time)
CLUSTER BY accusation_details.bias_type;


-- ════════════════════════════════════════════════════════════════════
-- [007] body_health_and_medical_history
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.body_health_and_medical_history (
  record_id STRING NOT NULL,
  
  -- الشخص/المجموعة
  subject_type STRING,                  -- individual/group/society
  subject_id STRING,                    -- FK if individual
  
  -- الحالة الصحية
  condition STRUCT<
    condition_type STRING,              -- epidemic/chronic_illness/injury/mental_health
    description STRING,
    duration STRING,
    outcome STRING                      -- recovery/death/permanent_disability
  >,
  
  -- السياق الطبي
  medical_context STRUCT<
    treatments_received ARRAY<STRING>,
    physicians_consulted ARRAY<STRING>,
    understanding_of_illness STRING     -- humorism/divine_punishment/contagion
  >,
  
  -- التأثير المعرفي
  intellectual_impact STRUCT<
    productivity_impact STRING,         -- stopped_writing/dictated/increased_output
    thematic_impact STRING,             -- focus_on_death/theodicy/medicine
    career_impact STRING                -- resignation/travel_for_cure
  >,
  
  -- الوفاة (إن وجدت)
  death_details STRUCT<
    cause_of_death STRING,
    age_at_death INT64,
    impact_of_death STRING              -- school_closure/succession_crisis
  >,
  
  metadata STRUCT<
    source_text_id STRING
  >
)
PARTITION BY DATE(timestamp) -- needs a proper date field
CLUSTER BY condition.condition_type;


-- ════════════════════════════════════════════════════════════════════
-- [008] book_metadata_registry
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.book_metadata_registry` (
    book_id STRING, 
    title STRING, 
    author_id STRING, 
    composition_date_gregorian INT64, -- Cluster Key
    composition_location_id STRING,
    subject_tags ARRAY<STRING>
) CLUSTER BY composition_date_gregorian;


-- ════════════════════════════════════════════════════════════════════
-- [009] causal_graph_structure
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.causal_graph_structure ( causal_link_id STRING NOT NULL, -- Causal Relationship cause STRUCT variable_name STRING, variable_type STRING, source_table STRING >, effect STRUCT variable_name STRING, variable_type STRING, source_table STRING >, -- Causal Strength (🔥 THE KEY!) causal_strength STRUCT strength_type STRING, -- strong/moderate/weak/conditional -- Quantification effect_size FLOAT64, -- "1 unit change in cause → X change in effect" confidence_interval STRING, -- Statistical Methods Used identification_method STRING, -- RCT/IV/DID/RDD/Granger/SCM -- Evidence evidence ARRAY<STRUCT evidence_type STRING, -- experimental/quasi-experimental/observational study_reference STRING, quality_score FLOAT64 >> >, -- Mechanisms (HOW does cause lead to effect?) mechanisms ARRAY<STRUCT mechanism_description STRING, mediating_variables ARRAY<STRING>, -- Testable implications testable_predictions ARRAY<STRING> >>, -- Confounders (3rd variables) confounders ARRAY<STRUCT confounder_name STRING, confounding_strength FLOAT64, -- Adjustment strategy adjustment_method STRING -- stratification/matching/regression/IV >>, -- Time Dynamics temporal_dynamics STRUCT immediate_effect FLOAT64, lag_years INT64, -- how long until effect manifests? duration_years INT64, -- how long does effect last? -- Decay decay_function STRING -- exponential/linear/none >, -- Nonlinearities & Thresholds nonlinear_effects STRUCT is_nonlinear BOOLEAN, thresholds ARRAY<STRUCT threshold_value FLOAT64, regime_below STRING, regime_above STRING >>, saturation STRUCT saturates BOOLEAN, saturation_point FLOAT64 >> >, -- Validation validation STRUCT validated_periods ARRAY<STRING>, out_of_sample_accuracy FLOAT64, -- Robustness checks robustness ARRAY<STRUCT check_type STRING, -- placebo_test/sensitivity/falsification result STRING >> >, metadata STRUCT created_at TIMESTAMP, confidence_level STRING >)CLUSTER BY cause.variable_name, effect.variable_name;


-- ════════════════════════════════════════════════════════════════════
-- [010] censorship_mechanisms_and_taboos
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.censorship_mechanisms_and_taboos ( censorship_record_id STRING NOT NULL, -- السياق الزمني period_start DATE, period_end DATE, century_hijri STRING, -- المحتوى المُستهدف targeted_content STRUCT content_type STRING, -- text/topic/method/question/person -- إن كان نصاً text_info STRUCT text_id STRING, text_title STRING, author_id STRING, -- ما المستهدف تحديداً؟ specific_sections ARRAY<STRING> >>, -- إن كان موضوعاً topic_info STRUCT topic_name STRING, topic_description STRING, domain STRING >>, -- الخطورة المزعومة alleged_danger STRUCT danger_type ARRAY<STRING>, -- heretical/seditious/immoral/confusing/foreign danger_description STRING, danger_to_whom STRING -- religion/state/morals/public_order >> >, -- نوع الرقابة censorship_type STRING, -- prohibition/burning/rewriting/selective_omission/stigmatization/obfuscation -- الفاعلون actors STRUCT -- السلطة الرقابية censoring_authority STRUCT authority_type STRING, -- state/religious_establishment/scholarly_consensus/mob/self authority_holders ARRAY<STRUCT holder_id STRING, holder_role STRING, -- caliph/qadi/muhtasib/scholar_elite holder_motivation STRING >>, -- القوة enforcement_power STRING -- absolute/strong/moderate/weak >>, -- المُدافعون defenders ARRAY<STRUCT defender_id STRING, defense_strategy STRING, defense_success STRING >>, -- الممتثلون compliers ARRAY<STRUCT complier_id STRING, compliance_type STRING, -- active_support/passive_acceptance/reluctant/strategic compliance_motivation STRING >> >, -- الآليات mechanisms STRUCT -- الرسمية formal_mechanisms ARRAY<STRUCT mechanism STRING, -- decree/fatwa/inquisition/licensing/book_burning mechanism_description STRING, -- المؤسسات implementing_institutions ARRAY<STRING>, -- الفعالية effectiveness STRING >>, -- غير الرسمية informal_mechanisms ARRAY<STRUCT mechanism STRING, -- social_pressure/ridicule/exclusion/intimidation/violence how_it_works STRING, prevalence STRING >>, -- الرقابة الذاتية self_censorship STRUCT is_prevalent BOOLEAN, manifestations ARRAY<STRUCT manifestation STRING, -- euphemism/omission/ambiguity/esoteric_writing examples ARRAY<STRING> >>, -- الدوافع motivations ARRAY<STRING>, -- fear/prudence/internalization/calculation -- الأثر impact_on_discourse STRING >> >, -- المحرمات (Taboos) taboos STRUCT -- القائمة taboo_topics ARRAY<STRUCT topic STRING, taboo_level STRING, -- absolute/strong/moderate/situational -- متى أصبح محرماً؟ emergence_date DATE, emergence_context STRING, -- الاستثناءات exceptions ARRAY<STRUCT exception_context STRING, who_can_violate STRING >>, -- العقوبات penalties ARRAY<STRING> >>, -- التحولات taboo_shifts ARRAY<STRUCT shift_date DATE, what_changed STRING, direction STRING, -- stricter/looser drivers ARRAY<STRING> >> >, -- الالتفاف (Circumvention) circumvention STRUCT -- الاستراتيجيات strategies ARRAY<STRUCT strategy STRING, -- coded_language/fictional_framing/hypothetical_mode/oral_only/smuggling strategy_description STRING, -- الأمثلة examples ARRAY<STRUCT example_text_id STRING, how_circumvented STRING >>, -- النجاح success_rate STRING >>, -- الشبكات السرية underground_networks STRUCT exist BOOLEAN, network_description STRING, members ARRAY<STRING> >> >, -- الانتهاكات والمقاومة violations_resistance STRUCT -- الانتهاكات violations ARRAY<STRUCT violator_id STRING, violation_type STRING, violation_date DATE, -- الدافع motivation STRING, -- العواقب consequences STRUCT immediate_consequences STRING, long_term_impact STRING >> >>, -- المقاومة المنظمة organized_resistance STRUCT exists BOOLEAN, resistance_forms ARRAY<STRING>, effectiveness STRING >> >, -- التأثير impact STRUCT -- على الإنتاج المعرفي impact_on_knowledge_production STRUCT quantitative_impact STRING, -- reduced_output/no_change/displaced qualitative_impact STRING, -- impoverished/distorted/enriched_through_subtlety -- المجالات المتأثرة affected_fields ARRAY<STRING>, -- الفقدان knowledge_lost ARRAY<STRING> >>, -- على المجتمع الفكري impact_on_intellectual_community STRUCT atmosphere STRING, -- chilling_effect/self_policing/fragmentation trust_level STRING, -- الهجرة الفكرية brain_drain STRUCT occurred BOOLEAN, destinations ARRAY<STRING> >> >>, -- على الثقافة cultural_impact STRING >, -- المقارنة comparative_analysis STRUCT -- مع فترات أخرى temporal_comparison STRING, -- مع حضارات أخرى civilizational_comparison ARRAY<STRUCT civilization STRING, their_censorship STRING, comparison STRING >> >, related_entities STRUCT related_texts ARRAY<STRING>, related_scholars ARRAY<STRING>, related_events ARRAY<STRING>, related_institutions ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)PARTITION BY period_startCLUSTER BY censorship_type, century_hijri;


-- ════════════════════════════════════════════════════════════════════
-- [011] civilizational_infiltration_ultimate
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.civilizational_infiltration_ultimate`
(
  -- 🔑 مفاتيح السطح (للسرعة والترتيب)
  infiltration_id STRING NOT NULL,
  source_civilization_main STRING, -- "Persian", "Indian", "Christian"
  infiltration_type_main STRING,   -- "Belief", "Ritual", "Admin_System"
  danger_level_main STRING,        -- "Critical", "Low"

  -- 📖 1)


-- ════════════════════════════════════════════════════════════════════
-- [012] civilizational_infiltration_v2
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.civilizational_infiltration_v2`
(
  -- 🔑 المفتاح الأساسي
  infiltration_id STRING NOT NULL,

  -- 📊 تصنيف عام
  infiltration_type STRING NOT NULL,        -- "Hadith", "Belief", "Practice", "Ritual", "Concept"
  source_civilization STRING NOT NULL,      -- "Persian", "Manichean", "Christian", "Indian", "Hellenistic"
  infiltration_status STRING NOT NULL,      -- "Deep_Rooted", "Partially_Expelled", "Expelled", "Still_Spreading"
  danger_level STRING NOT NULL,             -- "Critical", "High", "Medium", "Low",
  theological_category STRING,              -- "Aqeedah", "Fiqh", "Akhlaq", "Tasawwuf", "Siyasa"

  -- 1)


-- ════════════════════════════════════════════════════════════════════
-- [013] civilizational_shock_response
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.civilizational_shock_response` (
    shock_id STRING, shock_year INT64, shock_type STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [014] climatic_shifts_and_hydrology
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.climatic_shifts_and_hydrology` (
    event_id STRING, event_year INT64, region STRING, event_type STRING
) PARTITION BY RANGE_BUCKET(event_year, GENERATE_ARRAY(0, 1500, 50));


-- ════════════════════════════════════════════════════════════════════
-- [015] competitions_and_contests
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.competitions_and_contests ( competition_id STRING NOT NULL, -- التوقيت competition_date DATE, competition_century_hijri STRING, -- نوع المسابقة competition_type STRING, -- munazara/solving_challenge/position_competition/poetic_contest/medical_case/astronomical_prediction -- السياق context STRUCT location STRING, venue STRING, -- court/madrasa/public_square/private_gathering -- الراعي sponsor STRUCT sponsor_id STRING, sponsor_motivation STRING, -- prestige/entertainment/practical_need/ideological prize_offered STRING >>, -- الجمهور audience STRUCT audience_type ARRAY<STRING>, estimated_size INT64, audience_role STRING -- passive_observers/active_judges/participants >> >, -- المتنافسون competitors STRUCT competitors_list ARRAY<STRUCT competitor_id STRING, -- FK → author_profiles_master competitor_name STRING, affiliation STRING, -- madhhab/institution/patron -- الخلفية background STRUCT age INT64, reputation_before STRING, preparation STRING >>, -- الاستراتيجية strategy STRUCT approach_type STRING, tactics ARRAY<STRING>, rhetorical_style STRING >> >>, number_of_competitors INT64 >, -- القواعد والمعايير rules_and_criteria STRUCT -- القواعد rules ARRAY<STRING>, -- معايير الفوز winning_criteria STRUCT stated_criteria ARRAY<STRING>, actual_criteria ARRAY<STRING>, -- قد تختلف! weighting STRUCT argument_strength FLOAT64, rhetorical_skill FLOAT64, political_acceptability FLOAT64, audience_appeal FLOAT64 >> >>, -- الحكام judges STRUCT judges_list ARRAY<STRUCT judge_id STRING, judge_credentials STRING, potential_bias STRING >>, judging_process STRING >> >, -- المحتوى content STRUCT -- الموضوع topic STRING, subtopics ARRAY<STRING>, -- التحدي المحدد specific_challenge STRUCT challenge_description STRING, challenge_difficulty STRING, -- هل سبق حله؟ previously_solved BOOLEAN >>, -- الحجج المقدمة arguments_presented ARRAY<STRUCT argument_by STRING, argument_summary STRING, argument_type STRING, -- textual/rational/empirical/analogical -- الرد responses ARRAY<STRUCT response_by STRING, response_summary STRING >> >> >, -- الديناميكية dynamics STRUCT -- سير المسابقة unfolding ARRAY<STRUCT phase INT64, phase_description STRING, turning_points ARRAY<STRING> >>, -- الأحداث غير المتوقعة surprises ARRAY<STRING>, -- التوتر tension_level STRING, -- التدخلات الخارجية external_interventions ARRAY<STRUCT intervention_type STRING, intervener STRING, impact STRING >> >, -- النتيجة outcome STRUCT -- الفائز winner STRUCT winner_id STRING, winning_performance_summary STRING, -- هل كان متوقعاً؟ was_expected BOOLEAN, -- الهامش victory_margin STRING -- decisive/narrow/controversial >>, -- التصنيفات rankings ARRAY<STRUCT rank INT64, competitor_id STRING, score_or_assessment STRING >>, -- الجوائز prizes_awarded STRUCT material_prizes ARRAY<STRING>, symbolic_rewards ARRAY<STRING>, -- المناصب positions_granted ARRAY<STRUCT position STRING, recipient STRING >> >> >, -- التأثير impact STRUCT -- على المتنافسين impact_on_competitors ARRAY<STRUCT competitor_id STRING, career_impact STRUCT immediate_impact STRING, long_term_impact STRING >>, reputation_change STRING >>, -- على المجال impact_on_field STRUCT methodological_advances ARRAY<STRING>, new_problems_identified ARRAY<STRING>, -- التحولات paradigm_shifts ARRAY<STRING> >>, -- على المعايير impact_on_standards STRUCT standards_reinforced ARRAY<STRING>, standards_challenged ARRAY<STRING>, new_standards_emerged ARRAY<STRING> >> >, -- الجدالات اللاحقة controversies STRUCT was_controversial BOOLEAN, disputes ARRAY<STRUCT dispute_topic STRING, disputing_parties ARRAY<STRING>, dispute_resolution STRING >>, -- الروايات المتنافسة competing_narratives ARRAY<STRUCT narrative_version STRING, narrative_by STRING >> >, -- الذاكرة memory STRUCT how_remembered STRING, commemorations ARRAY<STRING>, -- النصوص المُنتجة texts_about_competition ARRAY<STRING> >, related_entities STRUCT related_scholars ARRAY<STRING>, related_texts ARRAY<STRING>, related_institutions ARRAY<STRING>, related_events ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)PARTITION BY competition_dateCLUSTER BY competition_type, competition_century_hijri;


-- ════════════════════════════════════════════════════════════════════
-- [016] comprehensive_timeline_events
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.comprehensive_timeline_events`
(
    event_id STRING,
    
    -- التوقيت الدقيق (Top Level للتقسيم)
    event_date DATE OPTIONS(description="تاريخ افتراضي 1-1 للسنة إذا لم يحدد اليوم"),
    hijri_year INT64,
    gregorian_year INT64,
    
    -- تصنيف الحدث
    event_category STRING OPTIONS(description="Political, Intellectual, Scientific, Natural, Economic"),
    event_weight INT64 OPTIONS(description="وزن الحدث من 1-10 لتحديد أهميته في الرسم البياني"),
    
    -- التفاصيل
    event_name_ar STRING,
    description STRING,
    location_region STRING,
    
    -- الفاعلون
    key_figures ARRAY<STRUCT<
        person_id STRING,
        role_in_event STRING
    >>,

    -- الترابط السببي (Causality)
    causal_links STRUCT<
        triggered_by_event_ids ARRAY<STRING>,
        caused_event_ids ARRAY<STRING>
    >,

    -- الموثوقية
    date_precision STRING OPTIONS(description="Exact Day, Month Only, Year Only, Decade Estimated")
)
PARTITION BY DATE_TRUNC(event_date, YEAR)
CLUSTER BY event_category, hijri_year;


-- ════════════════════════════════════════════════════════════════════
-- [017] concubine_slave_cultural_infiltration
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.concubine_slave_cultural_infiltration`
(
  -- ═══════════════════════════════════════════════════════════════════
  -- 🔑 المفتاح الأساسي
  -- ═══════════════════════════════════════════════════════════════════
  infiltration_id STRING NOT NULL,
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 📊 حقول التصنيف الأساسية
  -- ═══════════════════════════════════════════════════════════════════
  infiltration_type STRING NOT NULL,        -- "Political", "Educational", "Musical", "Linguistic", "Culinary", "Superstitious", "Ritualistic", "Values"
  
  transmission_channel STRING NOT NULL,     -- "Royal_Mothers", "Nannies", "Singing_Slaves", "Domestic_Slaves", "Eunuchs", "Concubines"
  
  source_civilization STRING NOT NULL,      -- "Persian", "Turkic", "African", "Byzantine", "Indian"
  
  social_class STRING NOT NULL,             -- "Royal_Court", "Elite", "Wealthy", "Merchants", "General_Public"
  
  danger_level STRING NOT NULL,             -- "Critical", "High", "Medium", "Low"
  
  islamic_compatibility STRING,             -- "Compatible", "Neutral", "Problematic", "Forbidden"
  
  theological_severity STRING,              -- "Kufr", "Shirk", "Bid'ah_Kubra", "Bid'ah_Sughra", "Makruh", "Permissible"
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 👑 1)


-- ════════════════════════════════════════════════════════════════════
-- [018] counterfactual_parameter_space
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.counterfactual_parameter_space ( counterfactual_id STRING NOT NULL, -- The Scenario scenario STRUCT scenario_name STRING, -- "Printing_Press_1450" scenario_description STRING, -- Base Reality (what actually happened) base_reality_id STRING, -- FK → comprehensive_timeline_events -- Divergence Point divergence STRUCT divergence_date DATE, divergence_event STRING, actual_outcome STRING, counterfactual_outcome STRING >> >, -- Parameter Interventions (🔥 THE EXECUTABLE PART!) parameter_interventions ARRAY<STRUCT parameter_name STRING, -- "manuscript_production_cost", "literacy_rate" -- Source equation/rule affects_equation_id STRING, -- FK → system_dynamics_equations affects_rule_id STRING, -- FK → agent_behavioral_rules -- Intervention intervention STRUCT intervention_type STRING, -- set_value/multiply/add/functional -- If set_value new_value FLOAT64, -- If multiply/add multiplier FLOAT64, addend FLOAT64, -- If functional transformation_function STRING, -- Timing intervention_start_date DATE, intervention_duration STRING -- permanent/temporary/gradual >>, -- Rationale justification STRING, -- why this intervention makes sense plausibility FLOAT64 -- 0-100, how plausible is this intervention? >>, -- Cascading Effects (what else changes?) cascading_effects STRUCT -- Direct effects direct_effects ARRAY<STRUCT affected_variable STRING, effect_magnitude FLOAT64, effect_direction STRING, -- increase/decrease effect_mechanism STRING >>, -- Second-order effects indirect_effects ARRAY<STRUCT affected_variable STRING, mediated_by ARRAY<STRING>, -- which variables mediate? effect_lag_years INT64, effect_magnitude FLOAT64 >>, -- Feedback amplification feedback_amplification STRUCT amplifies BOOLEAN, amplification_factor FLOAT64, saturation_point FLOAT64 >> >, -- Simulation Protocol simulation_protocol STRUCT -- Time horizon simulation_start_date DATE, simulation_end_date DATE, time_step STRING, -- yearly/decade/continuous -- Monte Carlo monte_carlo_runs INT64, -- for stochastic simulations -- Constraints constraints ARRAY<STRUCT constraint_type STRING, -- physical/logical/historical constraint_expression STRING -- "literacy_rate <= 1.0" >>, -- Stopping Conditions stopping_conditions ARRAY<STRING> -- "if state_collapse = TRUE, stop" >, -- Results (after simulation) simulation_results STRUCT executed BOOLEAN, execution_date TIMESTAMP, -- Outcomes outcome_trajectories ARRAY<STRUCT variable_name STRING, trajectory JSON, -- time series data divergence_from_actual FLOAT64 -- how different from reality? >>, -- Key Findings key_insights ARRAY<STRING>, -- Comparison with Reality comparison STRUCT similarity_score FLOAT64, -- 0-100 divergence_points ARRAY<STRUCT date DATE, variable STRING, actual_value FLOAT64, simulated_value FLOAT64 >> >> >, metadata STRUCT created_at TIMESTAMP, simulated_by STRING, confidence_level STRING >)CLUSTER BY scenario.divergence.divergence_date, simulation_results.executed;


-- ════════════════════════════════════════════════════════════════════
-- [019] cultural_infiltration_into_fiqh
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.cultural_infiltration_into_fiqh` (
    infiltration_id STRING, period STRING, foreign_concept STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [020] data_quality_quarantine
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.data_quality_quarantine`
(
    issue_id STRING,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    
    -- الملف المصاب
    file_id STRING,
    
    -- نوع العلة
    error_category STRING, -- Encoding, Truncated, Formatting, Gibberish
    severity_level STRING, -- Critical (Block), Warning (Flag only)
    
    -- تقرير الطبيب (الـ AI أو الكود)
    diagnostic_report STRUCT<
        error_message STRING,
        stack_trace STRING,
        detected_by_agent STRING -- من اكتشف الخطأ؟ (الشيّال أم خبير العطور؟)
    >,
    
    -- العينة الفاسدة (للفحص اليدوي)
    corrupted_snippet STRING,
    
    -- الحالة
    status STRING -- New, Reviewed, Ignored, Fixed
)
PARTITION BY DATE(timestamp)
CLUSTER BY error_category;


-- ════════════════════════════════════════════════════════════════════
-- [021] dreams_visions_and_spiritual_experiences
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.dreams_visions_and_spiritual_experiences (
  experience_id STRING NOT NULL,
  
  -- السياق
  date_of_experience DATE,
  century_hijri STRING,
  location STRING,
  
  -- صاحب التجربة
  experiencer STRUCT<
    person_id STRING,                   -- FK → author_profiles_master
    name STRING,
    role STRING,                        -- ruler/scholar/mystic/commoner
    psychological_state STRING          -- anxious/seeking/ill/normal
  >,
  
  -- المحتوى
  content STRUCT<
    type STRING,                        -- dream/waking_vision/spiritual_encounter
    description STRING,
    key_symbols ARRAY<STRING>,          -- figures/objects/actions
    figures_appearing ARRAY<STRING>     -- Prophet/angels/past_scholars/rulers
  >,
  
  -- التفسير
  interpretation STRUCT<
    interpreter_id STRING,              -- if interpreted by someone else
    interpretation_text STRING,
    methodology STRING                  -- symbolic/literal/quranic/folk
  >,
  
  -- التأثير (The crucial part)
  impact STRUCT<
    personal_impact STRING,             -- conversion/repentance/career_change
    political_impact STRING,            -- legitimized_rule/started_war/policy_change
    intellectual_impact STRING,         -- solved_problem/inspired_book/changed_madhhab
    social_impact STRING                -- started_movement/public_panic/celebration
  >,
  
  -- المصدر
  source_text_id STRING,                -- where was it recorded?
  authenticity_assessment STRING,       -- by contemporaries/later scholars
  
  metadata STRUCT<
    curator_notes STRING
  >
)
PARTITION BY date_of_experience
CLUSTER BY content.type, experiencer.role;


-- ════════════════════════════════════════════════════════════════════
-- [022] economics_of_knowledge_production
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.economics_of_knowledge_production ( economic_record_id STRING NOT NULL, -- السياق period STRING, location STRING, -- نوع النشاط المعرفي activity_type STRING, -- writing/copying/teaching/translating/research -- التكاليف costs STRUCT -- المواد material_costs STRUCT paper_or_parchment_cost FLOAT64, ink_cost FLOAT64, binding_cost FLOAT64, currency STRING, -- التقدير total_material_cost FLOAT64, estimation_source STRING >>, -- العمالة labor_costs STRUCT copyist_wage FLOAT64, wage_per_page FLOAT64, time_required_days INT64, total_labor_cost FLOAT64 >>, -- البنية التحتية infrastructure_costs STRUCT library_maintenance FLOAT64, facility_rental FLOAT64, tool_costs FLOAT64 >>, -- الفرصة البديلة opportunity_cost STRUCT scholar_could_earn_elsewhere FLOAT64, opportunity_cost_description STRING >>, -- الإجمالي total_estimated_cost FLOAT64, -- المقارنة equivalent_in_commodities STRUCT wheat_kg FLOAT64, gold_dinars FLOAT64, days_of_labor FLOAT64 >> >, -- مصادر التمويل funding_sources STRUCT primary_source STRING, -- waqf/patron/self_funded/stipend/trade sources_breakdown ARRAY<STRUCT source_type STRING, source_id STRING, -- FK → waqf_id أو ruler_id amount_contributed FLOAT64, percentage FLOAT64, -- الشروط المفروضة conditions ARRAY<STRING> >>, -- الاستقرار المالي financial_stability STRING -- secure/precarious/crisis >, -- العوائد (إن وُجدت) returns STRUCT -- مادية material_returns STRUCT direct_income FLOAT64, -- مبيعات/هدايا/مكافآت indirect_benefits STRING, -- منصب/شهرة/شبكات roi FLOAT64 -- return on investment >>, -- رمزية symbolic_returns STRUCT prestige_gain STRING, social_capital_gain STRING, political_influence STRING >>, -- طويلة المدى long_term_value STRING >, -- التأثير على الإنتاج impact_on_production STRUCT -- هل الموارد كافية؟ resource_adequacy STRING, -- abundant/adequate/scarce/insufficient -- القيود constraints ARRAY<STRUCT constraint_type STRING, -- financial/material/institutional constraint_description STRING, -- الأثر impact_on_output STRING -- major/moderate/minor >>, -- الابتكارات لخفض التكلفة cost_innovations ARRAY<STRING> -- cheaper_paper/faster_copying/collaborative_production >, -- المقارنة عبر الزمن temporal_trends STRUCT cost_changes ARRAY<STRUCT period STRING, cost_level STRING, -- increasing/stable/decreasing reasons ARRAY<STRING> >>, -- نقاط التحول turning_points ARRAY<STRUCT date DATE, change STRING, -- e.g., introduction of cheap paper impact STRING >> >, -- المقارنة عبر المناطق regional_variations STRUCT regional_data ARRAY<STRUCT region STRING, cost_level_relative STRING, -- higher/similar/lower reasons ARRAY<STRING> >> >, -- الأزمات الاقتصادية economic_crises STRUCT crisis_periods ARRAY<STRUCT crisis_period STRING, crisis_type STRING, -- inflation/shortage/war/plague -- الأثر على المعرفة impact_on_scholarship STRUCT production_change STRING, -- ceased/reduced/maintained/increased quality_impact STRING, notable_consequences ARRAY<STRING> >> >> >, related_entities STRUCT related_scholars ARRAY<STRING>, related_institutions ARRAY<STRING>, related_awqaf ARRAY<STRING>, related_texts ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, estimation_method STRING, confidence_level STRING >)CLUSTER BY period, activity_type;


-- ════════════════════════════════════════════════════════════════════
-- [023] entity_graph_index
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.entity_graph_index (
  entity_id STRING NOT NULL,
  
  -- الكيان
  entity_info STRUCT
    entity_name STRING,
    entity_type STRING,                  -- scholar/text/event/concept/institution/location/method
    
    -- الجدول الأساسي
    primary_table STRING,                -- الجدول الذي يملك السجل الرئيسي
    primary_record_id STRING
  >,
  
  -- الظهور في الجداول (محسّن!)
  appearances ARRAY<STRUCT
    table_name STRING,
    record_id STRING,
    
    -- نوع الظهور (🔥 جديد!)
    appearance_type STRING,              -- primary_subject/secondary_actor/mentioned/cited/influenced_by
    
    -- الأهمية النسبية
    relevance_score FLOAT64,             -- 0-100
    
    -- السياق
    context_snippet STRING,
    
    -- العلاقة المحددة
    relationship_to_record STRING        -- author/subject/opponent/patron/student
  >>,
  
  -- الإحصائيات (للتحليل السريع)
  statistics STRUCT
    total_appearances INT64,
    primary_appearances INT64,
    secondary_appearances INT64,
    
    -- توزيع حسب النوع
    distribution_by_type ARRAY<STRUCT
      entity_type STRING,
      count INT64
    >>,
    
    -- التوزيع الزمني
    temporal_distribution ARRAY<STRUCT
      century STRING,
      count INT64
    >>
  >,
  
  -- المقاييس الشبكية (للتحليل)
  network_metrics STRUCT
    -- المركزية
    degree_centrality FLOAT64,           -- عدد الروابط
    betweenness_centrality FLOAT64,      -- كم مرة يقع في مسار بين آخرين
    closeness_centrality FLOAT64,        -- قرب من المركز
    eigenvector_centrality FLOAT64,      -- أهمية بناءً على أهمية الجيران
    
    -- التجمع
    clustering_coefficient FLOAT64,      -- مدى تجمع الجيران
    
    -- التأثير
    pagerank_score FLOAT64               -- خوارزمية PageRank
  >,
  
  -- الروابط المباشرة (للاستعلامات السريعة)
  direct_connections STRUCT
    -- الأكثر ارتباطاً
    top_connected_entities ARRAY<STRUCT
      entity_id STRING,
      entity_name STRING,
      connection_strength FLOAT64,
      connection_type STRING
    >>,
    
    -- المجتمعات (Communities)
    communities ARRAY<STRING>            -- أي مجموعة ينتمي؟
  >,
  
  -- التطور الزمني
  temporal_evolution STRUCT
    first_appearance DATE,
    last_appearance DATE,
    
    -- الذروة
    peak_period STRUCT
      period STRING,
      appearance_count INT64
    >>,
    
    -- الاتجاه
    trend STRING                         -- rising/stable/declining/extinct
  >,
  
  metadata STRUCT
    last_updated TIMESTAMP,
    update_frequency STRING,             -- real_time/daily/weekly
    data_quality_score FLOAT64
  >
)
PARTITION BY entity_info.entity_type
CLUSTER BY network_metrics.degree_centrality DESC, statistics.total_appearances DESC;


-- ════════════════════════════════════════════════════════════════════
-- [024] entity_graph_index_enhanced
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.entity_graph_index_enhanced`
(
    entity_id STRING,
    entity_type STRING,
    primary_name STRING,
    
    -- مقاييس الشبكة (تحسب لاحقاً بـ Graph Algorithms)
    network_metrics STRUCT<
        degree_centrality FLOAT64, -- عدد الاتصالات المباشرة
        betweenness_centrality FLOAT64, -- هل هو "جسر" بين مجموعتين؟
        pagerank_score FLOAT64 -- أهميته بناء على أهمية من يرتبط بهم
    >,
    
    -- أماكن الظهور (للسرعة)
    appearance_summary ARRAY<STRUCT<table_name STRING, frequency INT64>>
)
CLUSTER BY entity_type;


-- ════════════════════════════════════════════════════════════════════
-- [025] epistemic_crises_and_ruptures
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.epistemic_crises_and_ruptures ( crisis_id STRING NOT NULL, -- التوقيت crisis_start_date DATE, crisis_peak_date DATE, crisis_resolution_date DATE, crisis_century_hijri STRING, -- طبيعة الأزمة crisis_nature STRUCT crisis_name STRING, crisis_type STRING, -- internal_contradiction/external_challenge/empirical_refutation/political_trauma -- الوصف crisis_description STRING, -- المجالات المتأثرة affected_domains ARRAY<STRING>, -- theology/law/science/politics/society -- الحدة severity STRING, -- existential/major/significant/moderate impact_scope STRING -- systemic/sectoral/local >, -- التراكم (ما قبل الأزمة) pre_crisis_accumulation STRUCT -- العوامل المساهمة contributing_factors ARRAY<STRUCT factor_type STRING, factor_description STRING, accumulation_period STRING >>, -- الإشارات المبكرة early_warning_signs ARRAY<STRUCT sign STRING, when_appeared DATE, who_noticed STRING, was_heeded BOOLEAN >> >, -- الانفجار (لحظة الأزمة) crisis_explosion STRUCT -- الحدث المحفز trigger_event STRUCT event_id STRING, -- FK → comprehensive_timeline_events event_description STRING, why_triggered_crisis STRING >>, -- المظاهر الأولى initial_manifestations ARRAY<STRUCT manifestation_type STRING, -- debate/treatise/fatwa/riot/persecution description STRING, key_actors ARRAY<STRING> >>, -- الصدمة الجماعية collective_shock STRUCT shock_description STRING, affected_groups ARRAY<STRING>, emotional_responses ARRAY<STRING> >> >, -- محاولات الاستجابة response_attempts STRUCT responses ARRAY<STRUCT response_type STRING, -- reaffirmation/adaptation/innovation/suppression proponent STRUCT proponent_id STRING, proponent_strategy STRING >>, -- النجاح/الفشل effectiveness STRING, adoption_level STRING, -- النصوص الناتجة produced_texts ARRAY<STRING> >>, -- الاستجابة المهيمنة dominant_response STRING >, -- التحول المعرفي (ما بعد الأزمة) post_crisis_transformation STRUCT was_resolved BOOLEAN, resolution_type STRING, -- synthesis/victory/suppression/compartmentalization/abandonment -- الإطار الجديد new_paradigm STRUCT paradigm_name STRING, key_features ARRAY<STRING>, how_different STRING, -- من بناه؟ architects ARRAY<STRING> >>, -- ما تغير؟ changes ARRAY<STRUCT change_domain STRING, before STRING, after STRING, permanence STRING -- permanent/temporary/partial >>, -- ما لم يتغير؟ continuities ARRAY<STRING> >, -- التكاليف والمكاسب costs_and_gains STRUCT -- الخسائر losses ARRAY<STRING>, -- lost_traditions/burned_books/exiled_scholars -- المكاسب gains ARRAY<STRING>, -- new_methods/new_institutions/new_synthesis -- التقييم net_assessment STRING >, -- الذاكرة والروايات memory_and_narratives STRUCT -- كيف تُذكر الأزمة؟ remembered_as STRING, -- الروايات المتنافسة competing_narratives ARRAY<STRUCT narrative_version STRING, narrative_by STRING, narrative_purpose STRING >>, -- الدروس المستفادة (المزعومة) lessons_claimed ARRAY<STRING> >, -- المقارنة comparative_perspective STRUCT similar_crises ARRAY<STRUCT crisis_id STRING, -- في الحضارة الإسلامية similarity STRING >>, crises_elsewhere ARRAY<STRUCT civilization STRING, their_crisis STRING, comparison STRING >> >, related_entities STRUCT related_texts ARRAY<STRING>, related_scholars ARRAY<STRING>, related_events ARRAY<STRING>, related_institutions ARRAY<STRING> >, metadata STRUCT created_at TIMESTAMP, curator_notes STRING >)PARTITION BY crisis_start_dateCLUSTER BY crisis_nature.crisis_type, crisis_century_hijri;


-- ════════════════════════════════════════════════════════════════════
-- [026] epistemic_silences_and_absences
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.epistemic_silences_and_absences ( silence_id STRING NOT NULL, -- التوقيت silence_period_start DATE, silence_period_end DATE, silence_century_hijri STRING, -- نوع الصمت silence_type STRING, -- topic/method/source/question/practice -- ما الذي غاب؟ absence_description STRUCT absent_topic STRING, absent_approach STRING, absent_source STRING, -- نص لم يُترجم/لم يُناقش -- السياق المقارن presence_elsewhere STRUCT present_in_civilization STRING, -- Byzantine/Jewish/Chinese form_there STRING, significance_there STRING > >, -- دلائل الغياب evidence_of_absence STRUCT evidence_type STRING, -- negative_evidence/comparative/statistical evidence_details ARRAY<STRUCT evidence_description STRING, confidence_level STRING >>, -- الاستثناءات النادرة rare_exceptions ARRAY<STRUCT exception_instance STRING, exception_context STRING, why_exceptional STRING >> >, -- تفسيرات محتملة للصمت possible_explanations STRUCT explanations ARRAY<STRUCT explanation_type STRING, -- ideological/practical/political/epistemological explanation_text STRING, plausibility STRING, -- high/medium/low supporting_evidence STRING >>, -- الأكثر ترجيحاً most_likely_explanation STRING >, -- آثار الصمت consequences STRUCT -- ماذا فُقد؟ lost_opportunities ARRAY<STRING>, -- مجالات لم تتطور underdeveloped_fields ARRAY<STRING>, -- تشوهات معرفية epistemic_distortions ARRAY<STRING>, -- التأثير طويل المدى long_term_impact STRING >, -- كسر الصمت breaking_the_silence STRUCT was_silence_broken BOOLEAN, break_date DATE, who_broke_it STRING, -- FK → author_profiles circumstances STRUCT trigger_event STRING, social_conditions STRING, reception STRING -- accepted/rejected/controversial >> >, -- التحليل الهيكلي structural_analysis STRUCT -- هل الصمت ممنهج؟ is_systematic BOOLEAN, -- المؤسسات المعنية institutions_involved ARRAY<STRING>, -- القوى المستفيدة من الصمت beneficiaries ARRAY<STRING>, -- آليات الإسكات silencing_mechanisms ARRAY<STRING> -- censorship/marginalization/ridicule/omission >, -- الربط related_entities STRUCT related_silences ARRAY<STRING>, -- FK → silence_id (أنماط) related_debates ARRAY<STRING>, related_political_events ARRAY<STRING> >, metadata STRUCT identified_by STRING, -- من اكتشف هذا الصمت؟ identification_method STRING, confidence_score FLOAT64, curator_notes STRING >)PARTITION BY silence_period_startCLUSTER BY silence_type, silence_century_hijri;


-- ════════════════════════════════════════════════════════════════════
-- [027] epistemology_of_natural_sciences
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.epistemology_of_natural_sciences` (
    epistemic_id STRING, 
    usul_concept STRING, -- e.g., Tanqih al-Manat
    scientific_application STRING -- e.g., Variable Isolation
);


-- ════════════════════════════════════════════════════════════════════
-- [028] errors_corrections_and_revisions
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.errors_corrections_and_revisions ( error_record_id STRING NOT NULL, -- الخطأ الأصلي original_error STRUCT -- من أخطأ؟ error_author_id STRING, -- FK → author_profiles_master error_author_name STRING, -- أين الخطأ؟ error_location STRUCT text_id STRING, -- FK → texts_full_corpus text_title STRING, specific_passage STRING, -- السياق surrounding_context STRING >>, -- نوع الخطأ error_type STRING, -- factual/logical/methodological/interpretive/computational/transcription -- الوصف error_description STRUCT what_was_claimed STRING, why_its_wrong STRING, -- الخطورة severity STRING, -- trivial/minor/significant/fundamental -- الوضوح obviousness STRING -- obvious/subtle/only_visible_to_experts >>, -- السياق error_context STRUCT -- لماذا حدث؟ likely_causes ARRAY<STRUCT cause_type STRING, -- misunderstanding/lack_of_data/faulty_reasoning/bias/haste/transcription cause_description STRING, plausibility STRING >>, -- هل كان شائعاً؟ was_common_error BOOLEAN, prevalence_at_time STRING >> >, -- الاكتشاف discovery STRUCT -- متى اكتُشف؟ discovery_date DATE, time_lag_years INT64, -- كم استغرق اكتشاف الخطأ؟ -- من اكتشفه؟ discoverer STRUCT discoverer_id STRING, discoverer_name STRING, -- الخلفية discoverer_background STRUCT relationship_to_author STRING, -- student/rival/successor/contemporary/later_scholar expertise_level STRING, motivation STRING -- truth_seeking/rivalry/teaching/revision >> >>, -- كيف اكتُشف؟ discovery_method STRUCT method STRING, -- logical_analysis/new_data/experiment/comparison/revelation method_description STRING, -- الأدوات المستخدمة tools_used ARRAY<STRING> >>, -- صعوبة الاكتشاف discovery_difficulty STRING -- obvious/required_insight/required_technology >, -- التصحيح correction STRUCT -- التصحيح المقترح proposed_correction STRUCT correction_text STRING, correction_rationale STRING, -- البديل alternative_view STRING >>, -- منهج التصحيح correction_method STRUCT method_type STRING, -- direct_refutation/gentle_suggestion/implicit_correction -- الأدب والأسلوب tone STRING, -- respectful/harsh/neutral -- الحجج المستخدمة arguments ARRAY<STRUCT argument_type STRING, -- textual/rational/empirical argument_summary STRING, argument_strength STRING >> >>, -- النص المُصحح correction_text STRUCT text_id STRING, text_title STRING, passage_reference STRING >> >, -- الاستقبال reception STRUCT -- كيف استُقبل التصحيح؟ immediate_reception STRUCT acceptance_level STRING, -- widely_accepted/partially_accepted/rejected/ignored -- ردود الفعل reactions ARRAY<STRUCT reactor_id STRING, reaction_type STRING, -- agreement/disagreement/defense_of_original reaction_text STRING >> >>, -- الدفاع عن الخطأ الأصلي defense_attempts ARRAY<STRUCT defender_id STRING, defense_strategy STRING, defense_success STRING >>, -- الجدل controversy STRUCT was_controversial BOOLEAN, controversy_duration STRING, controversy_resolution STRING >> >, -- التأثير impact STRUCT -- على المجال impact_on_field STRUCT immediate_impact STRING, long_term_impact STRING, -- هل غيّر الممارسة؟ changed_practice BOOLEAN, change_description STRING >>, -- على سمعة المخطئ impact_on_author STRUCT reputation_change STRING, -- هل اعترف بالخطأ؟ acknowledgment STRUCT did_acknowledge BOOLEAN, acknowledgment_manner STRING, -- gracious/reluctant/defensive/never -- التصحيح الذاتي self_correction STRUCT did_self_correct BOOLEAN, correction_details STRING >> >> >>, -- على المعايير المنهجية impact_on_standards STRING >, -- التكرار والأنماط patterns STRUCT -- هل الخطأ تكرر؟ was_repeated BOOLEAN, recurrences ARRAY<STRUCT recurrence_author STRING, recurrence_date DATE, why_repeated STRING >>, -- أنماط الأخطاء المشابهة similar_errors ARRAY<STRING>, -- FK → error_record_id -- الدروس المستفادة lessons STRUCT methodological_lessons ARRAY<STRING>, theoretical_lessons ARRAY<STRING>, -- هل منع أخطاء مستقبلية؟ preventive_effect BOOLEAN >> >, -- التأريخ والذاكرة historiography STRUCT -- كيف يُذكر الخطأ؟ remembered_as STRING, -- التعليم pedagogical_use STRUCT used_in_teaching BOOLEAN, teaching_purpose STRING, -- warning/example/problem_solving -- الشهرة fame_level STRING -- infamous/well_known/obscure/forgotten >> >, related_entities STRUCT related_scholars ARRAY<STRING>, related_texts ARRAY<STRING>, related_errors ARRAY<STRING>, related_debates ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)CLUSTER BY original_error.error_type, discovery.time_lag_years DESC;


-- ════════════════════════════════════════════════════════════════════
-- [029] ethical_values_hierarchy
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.ethical_values_hierarchy`
(
    era_id STRING, -- العصر أو الدولة
    
    -- تصنيف طه عبد الرحمن
    ethical_stage STRING, -- "مرحلة الإسلام", "مرحلة الإيمان", "مرحلة الإحسان"
    civilization_type STRING, -- "حضارة القول" vs "حضارة العمل"
    
    -- مؤشرات الأخلاق
    moral_indicators STRUCT<
        justice_index FLOAT64, -- العدل الاجتماعي
        trusteeship_index FLOAT64, -- (الائتمانية) حفظ الأمانة
        creativity_index FLOAT64, -- (الإبداع السيادي) وليس التقليد
        mercy_index FLOAT64 -- التعامل مع الضعفاء
    >,

    -- المفارقات (النفاق الحضاري)
    hypocrisy_gap STRUCT<
        claimed_values ARRAY<STRING>, -- ما يقولون (خطب الجمعة)
        practiced_values ARRAY<STRING>, -- ما يفعلون (سياسة الملوك)
        gap_size STRING -- "فجوة سحيقة"
    >
)
CLUSTER BY ethical_stage, civilization_type;


-- ════════════════════════════════════════════════════════════════════
-- [030] extracted_tasks
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.smart_notebook.extracted_tasks (
task_id STRING NOT NULL,
source_note_id STRING NOT NULL,
user_id STRING NOT NULL,
title STRING,
description STRING,
priority STRING, -- "high", "medium", "low"
due_date DATE,
status STRING, -- "pending", "in_progress", "done", "cancelled"
created_at TIMESTAMP,
completed_at TIMESTAMP
);


-- ════════════════════════════════════════════════════════════════════
-- [031] fabricated_hadiths_network
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.fabricated_hadiths_network`
(
    fabrication_id STRING,
    
    -- النص الموضوع
    matn_text STRING,
    attributed_to STRING, -- Prophet, Ali, etc.
    
    -- "الجاني" (الوضّاع)
    fabricator_profile STRUCT<
        name STRING,
        category STRING, -- "Political_Partisan" (شيعي/أموي), "Storyteller" (قاص), "Merchant" (ترويج سلع), "Zindiq"
        motivation STRING, -- "Support Ruler", "Sell Goods", "Corrupt Religion"
        network_affiliations ARRAY<STRING> -- هل هو جزء من عصابة وضع؟
    >,

    -- دورة حياة الكذبة (Viral Spread)
    spread_dynamics STRUCT<
        origin_city STRING, -- الكوفة، بغداد
        spread_velocity STRING, -- Rapid, Slow
        carriers ARRAY<STRING>, -- الكتب التي "شربت" المقلب ونشرته
        resistance_history ARRAY<STRING> -- من حاربه؟ (ابن الجوزي، الألباني)
    >,

    -- الأثر المعرفي (Damage Assessment)
    impact_on_thought STRUCT<
        schools_adopted_it ARRAY<STRING>, -- هل بنى عليه الصوفية/الفقهاء حكماً؟
        false_beliefs_generated ARRAY<STRING> -- عقائد نشأت من هذا الكذب
    >
)
CLUSTER BY fabricator_profile.category, spread_dynamics.origin_city;


-- ════════════════════════════════════════════════════════════════════
-- [032] fiqh_rulings_and_nawazil
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.fiqh_rulings_and_nawazil` (
    ruling_id STRING, issue_canonical_id STRING, ruling_text STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [033] forecasting_models
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.forecasting_models ( model_id STRING NOT NULL, -- Target Variable target_variable STRUCT variable_name STRING, variable_type STRING, source_table STRING, aggregation_level STRING -- annual/decadal >, -- Model Type model_type STRING, -- ARIMA/Prophet/LSTM/Ensemble/Bayesian_Structural -- Model Specification model_specification STRUCT -- For ARIMA arima_params STRUCT p INT64, -- autoregressive order d INT64, -- differencing q INT64, -- moving average order seasonal BOOLEAN, seasonal_period INT64 >>, -- For Prophet prophet_params STRUCT changepoints ARRAY<DATE>, seasonality_mode STRING, growth STRING -- linear/logistic >>, -- For LSTM lstm_params STRUCT layers INT64, units_per_layer INT64, lookback_window INT64 >>, -- Exogenous Variables exogenous_variables ARRAY<STRUCT variable_name STRING, source_table STRING, lag INT64 >> >, -- Training & Validation training STRUCT training_period STRUCT start_date DATE, end_date DATE >>, validation_period STRUCT start_date DATE, end_date DATE >>, -- Performance Metrics performance STRUCT mape FLOAT64, -- Mean Absolute Percentage Error rmse FLOAT64, mae FLOAT64, -- Forecast accuracy by horizon accuracy_by_horizon ARRAY<STRUCT horizon_years INT64, accuracy FLOAT64 >> >> >, -- Predictions predictions STRUCT forecast_horizon_years INT64, point_forecasts ARRAY<STRUCT date DATE, predicted_value FLOAT64 >>, prediction_intervals ARRAY<STRUCT date DATE, lower_bound FLOAT64, -- 95% CI upper_bound FLOAT64, confidence_level FLOAT64 >>, -- Uncertainty decomposition uncertainty STRUCT parameter_uncertainty FLOAT64, model_uncertainty FLOAT64, stochastic_uncertainty FLOAT64 >> >, -- Early Warning Signals early_warnings STRUCT warning_indicators ARRAY<STRUCT indicator_name STRING, -- "increasing_variance", "critical_slowing_down" threshold FLOAT64, current_value FLOAT64, alert_level STRING -- green/yellow/orange/red >>, -- Regime shift detection regime_shift_probability FLOAT64 -- 0-100 >, metadata STRUCT model_version STRING, last_retrained TIMESTAMP, retrain_frequency STRING -- yearly/when_new_data >)CLUSTER BY target_variable.variable_name, model_type;


-- ════════════════════════════════════════════════════════════════════
-- [034] foreign_reception_and_influence
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.foreign_reception_and_influence ( reception_record_id STRING NOT NULL, -- التوقيت reception_period_start DATE, reception_period_end DATE, -- الحضارة المستقبِلة receiving_civilization STRUCT civilization_name STRING, -- Latin_Europe/Byzantine/Jewish/Chinese/Indian geographical_region STRING, -- السياق cultural_context STRUCT dominant_religion STRING, political_situation STRING, intellectual_climate STRING, -- الموقف من الإسلام attitude_toward_islam STRING -- hostile/neutral/curious/admiring/mixed >> >, -- العمل/الفكرة المستقبَلة received_content STRUCT -- إن كان نصاً text_info STRUCT original_text_id STRING, -- FK → texts_full_corpus original_author STRING, original_title STRING, subject_area STRING >>, -- إن كان مفهوماً/منهجاً concept_or_method STRUCT concept_name STRING, concept_description STRING, originating_scholar STRING >>, -- الأهمية في السياق الإسلامي importance_in_islamic_context STRING >, -- قنوات النقل transmission_channels STRUCT channels ARRAY<STRUCT channel_type STRING, -- translation/direct_contact/intermediary/conquest/trade -- التفاصيل details STRUCT location STRING, date_range STRING, -- الوسطاء intermediaries ARRAY<STRUCT intermediary_name STRING, intermediary_role STRING, -- translator/merchant/diplomat/convert intermediary_background STRING >> >> >>, -- الترجمة (إن حدثت) translation_info STRUCT was_translated BOOLEAN, target_language STRING, translator STRING, translation_quality STRING, -- التعديلات modifications_made ARRAY<STRING> >> >, -- الاستقبال reception_dynamics STRUCT -- الموجة الأولى initial_reception STRUCT reception_date DATE, recipients STRUCT who_received STRING, -- scholars/clergy/physicians/rulers social_position STRING >>, first_reactions ARRAY<STRUCT reaction_type STRING, -- enthusiasm/suspicion/rejection/selective_adoption reaction_by STRING, reaction_rationale STRING >> >>, -- الجدالات controversies STRUCT was_controversial BOOLEAN, controversies_list ARRAY<STRUCT controversy_topic STRING, positions ARRAY<STRUCT position STRING, -- acceptance/rejection/adaptation proponents ARRAY<STRING>, arguments ARRAY<STRING> >>, resolution STRING >> >>, -- التبني adoption_pattern STRUCT adoption_level STRING, -- widespread/selective/limited/rejected -- ما الذي تُبنِّي؟ adopted_aspects ARRAY<STRING>, -- ما الذي رُفض؟ rejected_aspects ARRAY<STRING>, -- لماذا الانتقائية؟ selectivity_rationale STRING >> >, -- التكييف والتحوير adaptation STRUCT -- كيف غُيِّر؟ modifications ARRAY<STRUCT modification_type STRING, -- de-islamization/christianization/rationalization/simplification modification_description STRING, motivation STRING, -- الأثر impact_on_meaning STRING >>, -- الاندماج في التقليد المحلي integration STRUCT integration_strategy STRING, -- الإسناد attribution_practice STRING, -- acknowledged/attributed_wrongly/anonymized/claimed_as_own examples ARRAY<STRUCT example STRING, attribution_given STRING, correct_attribution STRING >> >> >, -- التأثير impact STRUCT -- التأثير المباشر direct_impact ARRAY<STRUCT impact_domain STRING, -- medicine/astronomy/philosophy/mathematics/technology impact_description STRING, significance STRING >>, -- التأثير غير المباشر indirect_impact ARRAY<STRING>, -- الأعمال المُشتقة derivative_works ARRAY<STRUCT work_title STRING, author STRING, relationship_to_original STRING, -- commentary/expansion/refutation/synthesis prominence STRING >>, -- التأثير المؤسسي institutional_impact STRUCT affected_institutions ARRAY<STRING>, curricula_changes ARRAY<STRING>, -- الإرث long_term_legacy STRING >> >, -- المقارنة مع الاستقبال الإسلامي comparative_reception STRUCT -- كيف يختلف الاستقبال الأجنبي؟ differences ARRAY<STRUCT dimension STRING, islamic_reception STRING, foreign_reception STRING, -- لماذا الاختلاف؟ reason_for_difference STRING >>, -- العكس (reverse influence) reverse_influence STRUCT did_reverse_influence_occur BOOLEAN, description STRING, examples ARRAY<STRING> >> >, -- الإنكار أو النسيان denial_and_amnesia STRUCT -- هل أُنكر التأثير لاحقاً؟ was_denied BOOLEAN, denial_instances ARRAY<STRUCT denial_period STRING, denial_by STRING, denial_reason STRING, -- ideological/religious/nationalist/epistemic -- الأدلة المتجاهلة ignored_evidence ARRAY<STRING> >>, -- إعادة الاكتشاف الحديثة modern_rediscovery STRUCT rediscovered BOOLEAN, rediscovery_date STRING, rediscovery_context STRING >> >, related_entities STRUCT related_texts ARRAY<STRING>, related_scholars ARRAY<STRING>, related_institutions ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)PARTITION BY reception_period_startCLUSTER BY receiving_civilization.civilization_name, received_content.text_info.subject_area;


-- ════════════════════════════════════════════════════════════════════
-- [035] geographical_locations_registry
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.geographical_locations_registry` (
    location_id STRING, 
    location_name STRING, 
    region STRING, -- Cluster Key
    coordinates GEOGRAPHY,
    modern_country STRING
) CLUSTER BY region;


-- ════════════════════════════════════════════════════════════════════
-- [036] global_hegemony_shifts
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.global_hegemony_shifts` (
    shift_id STRING, start_year INT64, dominant_power STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [037] hadith_corpus_analysis
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.hadith_corpus_analysis` (
    hadith_id STRING, matn STRING, isnad_chain ARRAY<STRING>
);


-- ════════════════════════════════════════════════════════════════════
-- [038] historical_questions_tracker
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.historical_questions_tracker ( question_id STRING NOT NULL, -- التقسيم الزمني question_emergence_date DATE, question_century_hijri STRING, -- السؤال نفسه question_text STRING, question_formulation STRUCT original_phrasing STRING, implicit_assumptions ARRAY<STRING>, -- الافتراضات الضمنية conceptual_framework STRING -- الإطار المفاهيمي للسؤال >, -- السياق question_context STRUCT emergence_circumstances STRING, who_asked STRING, -- من طرح السؤال؟ addressed_to STRING, -- موجه لمن؟ -- الدافع motivation_type STRING, -- theological/political/practical/intellectual urgency_level STRING -- crisis/important/routine >, -- التطور question_evolution STRUCT -- دورة حياة السؤال lifecycle ARRAY<STRUCT period STRING, status STRING, -- emerging/central/declining/resolved/forgotten frequency_of_discussion STRING, -- التحولات reformulations ARRAY<STRUCT new_formulation STRING, reformulation_date DATE, reformulation_reason STRING >> >>, -- الأسئلة الفرعية المتولدة derivative_questions ARRAY<STRING> -- FK → question_id (self) >, -- محاولات الإجابة answer_attempts STRUCT number_of_attempts INT64, approaches ARRAY<STRUCT approach_type STRING, -- rational/textual/mystical/pragmatic proponent_id STRING, -- FK → author_profiles answer_summary STRING, acceptance_level STRING -- consensus/majority/minority/rejected >>, -- هل تم "حل" السؤال؟ resolution_status STRUCT is_resolved BOOLEAN, resolution_date DATE, resolution_type STRING, -- answered/dissolved/transformed/suppressed resolution_description STRING >> >, -- التداعيات المعرفية epistemic_impact STRUCT -- ماذا فتح هذا السؤال؟ opened_avenues ARRAY<STRING>, -- ماذا أغلق؟ closed_avenues ARRAY<STRING>, -- المجالات المتأثرة affected_disciplines ARRAY<STRING>, -- التحولات المفاهيمية conceptual_shifts_triggered ARRAY<STRING> >, -- الرقابة والتابوهات censorship STRUCT was_censored BOOLEAN, censorship_period STRING, censorship_authority STRING, censorship_reason STRING, -- الأسئلة الممنوعة forbidden_aspects ARRAY<STRING> >, -- المقارنة عبر-حضارية cross_civilizational STRUCT similar_questions_elsewhere ARRAY<STRUCT civilization STRING, -- Greek/Christian/Jewish/Chinese question_form STRING, time_lag INT64, -- فارق زمني answer_divergence STRING -- كيف اختلفت الأجوبة؟ >> >, -- الربط related_entities STRUCT related_texts ARRAY<STRING>, related_debates ARRAY<STRING>, related_concepts ARRAY<STRING>, related_events ARRAY<STRING> >, metadata STRUCT created_at TIMESTAMP, curator_notes STRING >)PARTITION BY question_emergence_dateCLUSTER BY question_century_hijri, question_context.motivation_type;


-- ════════════════════════════════════════════════════════════════════
-- [039] ijaza_chains_and_transmission
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.ijaza_chains_and_transmission ( ijaza_record_id STRING NOT NULL, -- التوقيت ijaza_date DATE, ijaza_century_hijri STRING, -- الإجازة ijaza_info STRUCT ijaza_type STRING, -- riwaya/diraya/ijaza_amma/ijaza_khassa/munawalah -- النص/المادة المُجاز فيها subject_matter STRUCT subject_type STRING, -- specific_text/collection/madhhab/general_knowledge -- إن كان نصاً محدداً text_id STRING, -- FK → book_metadata_registry text_title STRING, -- إن كان مجالاً عاماً field STRING >> >, -- المُجيز (المانح) grantor STRUCT grantor_id STRING, -- FK → author_profiles_master grantor_name STRING, -- مؤهلاته qualifications STRUCT scholarly_credentials ARRAY<STRING>, reputation STRING, -- من أين حصل على الإجازة؟ grantor_ijaza_source STRUCT source_id STRING, -- FK → ijaza_record_id (recursive!) chain_link_number INT64, -- السلسلة full_chain ARRAY<STRING> -- أسماء كل الحلقات >> >>, -- الموقف من الإجازة granting_attitude STRING -- generous/strict/selective >, -- المُجاز (المتلقي) recipient STRUCT recipient_id STRING, -- FK → author_profiles_master recipient_name STRING, -- في وقت الإجازة at_time_of_ijaza STRUCT age INT64, level_of_study STRING, preparation_assessment STRING >>, -- علاقته بالمُجيز relationship_to_grantor STRUCT relationship_type STRING, -- student/colleague/visitor/correspondent duration_of_study STRING, intimacy_level STRING >> >, -- العملية process STRUCT -- كيف حصل عليها؟ acquisition_method STRING, -- full_reading/hearing/examination/correspondence/request -- إن كان قراءة reading_details STRUCT reading_method STRING, -- solo/group/dictation number_of_sessions INT64, -- الفحص examination STRUCT was_examined BOOLEAN, examination_rigor STRING, performance_assessment STRING >> >>, -- الشهود witnesses ARRAY<STRUCT witness_name STRING, witness_role STRING >>, -- الوثيقة documentation STRUCT has_written_document BOOLEAN, document_format STRING, -- certificate/note_in_manuscript/oral_only -- إن موجودة document_location STRING, document_condition STRING >> >, -- الشروط والقيود conditions STRUCT explicit_conditions ARRAY<STRING>, restrictions STRUCT transmission_restrictions ARRAY<STRING>, usage_restrictions ARRAY<STRING>, -- التحذيرات caveats ARRAY<STRING> >> >, -- السلسلة الكاملة (الإسناد) full_chain STRUCT -- عدد الحلقات chain_length INT64, -- التسلسل chain_sequence ARRAY<STRUCT link_number INT64, scholar_id STRING, scholar_name STRING, -- التاريخ التقريبي approximate_date DATE, -- الموثوقية reliability_assessment STRING >>, -- الخصائص chain_characteristics STRUCT chain_type STRING, -- strong/weak/mixed/controversial -- الانقطاعات gaps ARRAY<STRUCT gap_location STRING, -- بين أي حلقتين gap_type STRING, -- missing_link/weak_link/disputed_link gap_impact STRING >>, -- العلو (القرب من المصدر) elevation STRING -- high/medium/low >> >, -- التحقق والنقد verification STRUCT -- هل تم التحقق؟ was_verified BOOLEAN, verifiers ARRAY<STRUCT verifier_id STRING, verification_date DATE, verification_conclusion STRING, -- المنهج verification_method STRING >>, -- الشكوك doubts ARRAY<STRUCT doubt_type STRING, -- forgery/exaggeration/error/confusion raised_by STRING, evidence STRING, -- الرد rebuttals ARRAY<STRING> >> >, -- الاستخدام usage STRUCT -- كيف استُخدمت الإجازة؟ uses ARRAY<STRUCT use_type STRING, -- teaching/writing/legal_authority/prestige use_frequency STRING, -- الفعالية effectiveness STRING >>, -- التوريث onward_transmission STRUCT did_recipient_grant_ijaza BOOLEAN, number_of_ijazas_granted INT64, -- السلسلة تستمر derivative_chains ARRAY<STRING> -- FK → ijaza_record_id >> >, -- المقارنة comparative_analysis STRUCT -- مقارنة مع إجازات أخرى comparison_ijazas ARRAY<STRUCT comparison_ijaza_id STRING, similarity_level STRING, distinctive_features ARRAY<STRING> >>, -- التحولات عبر الزمن temporal_changes STRING -- كيف تغيرت ممارسة الإجازة؟ >, related_entities STRUCT related_scholars ARRAY<STRING>, related_texts ARRAY<STRING>, related_institutions ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)PARTITION BY ijaza_dateCLUSTER BY ijaza_info.ijaza_type, full_chain.chain_length;


-- ════════════════════════════════════════════════════════════════════
-- [040] implicit_assumptions_registry
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.implicit_assumptions_registry ( assumption_id STRING NOT NULL, -- السياق period STRING, domain STRING, -- theology/law/politics/science -- الافتراض assumption_description STRUCT assumption_text STRING, assumption_type STRING, -- ontological/epistemological/ethical/practical -- الصياغة الضمنية implicit_form STRING, -- كيف يظهر بين السطور -- الصياغة الصريحة (إن جُعل صريحاً) explicit_form STRING >, -- السياق التاريخي contextual_embedding STRUCT -- متى أصبح "بديهياً"؟ naturalization_period STRING, -- من روّجه؟ promoters ARRAY<STRING>, -- كيف انتشر؟ diffusion_mechanism STRING -- education/rhetoric/practice/coercion >, -- الكشف عن الافتراض detection STRUCT -- كيف اكتُشف أنه افتراض؟ detection_method STRING, -- textual_analysis/comparative/crisis_moment -- دلائله indicators ARRAY<STRUCT indicator_type STRING, -- linguistic/logical/rhetorical indicator_description STRING, text_examples ARRAY<STRING> >> >, -- التحديات والشكوك challenges STRUCT was_challenged BOOLEAN, challenge_instances ARRAY<STRUCT challenger_id STRING, challenge_date DATE, challenge_form STRING, -- explicit_rejection/implicit_subversion/reinterpretation reception STRING, -- accepted/rejected/ignored consequences STRING >> >, -- الانهيار أو التغير transformation STRUCT did_transform BOOLEAN, transformation_date DATE, -- ماذا حدث؟ transformation_type STRING, -- replaced/modified/abandoned/reversed new_assumption STRING, -- ما الذي أحدث التحول؟ catalysts ARRAY<STRUCT catalyst_type STRING, -- intellectual/social/technological/political catalyst_description STRING >> >, -- الآثار المعرفية epistemic_implications STRUCT -- ماذا أتاح هذا الافتراض؟ enabled_thinking ARRAY<STRING>, -- ماذا أعاق؟ constrained_thinking ARRAY<STRING>, -- البدائل غير المفكَّر فيها unthinkable_alternatives ARRAY<STRING> >, -- المقارنة comparative_analysis STRUCT -- الافتراضات المقابلة في حضارات أخرى equivalent_assumptions ARRAY<STRUCT civilization STRING, their_assumption STRING, difference STRING, consequence_of_difference STRING >> >, related_entities STRUCT related_assumptions ARRAY<STRING>, -- FK → assumption_id related_texts ARRAY<STRING>, related_debates ARRAY<STRING> >, metadata STRUCT identified_by STRING, identification_method STRING, confidence_level STRING, curator_notes STRING >)CLUSTER BY period, domain;


-- ════════════════════════════════════════════════════════════════════
-- [041] ingestion_tracking_ledger
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.ingestion_tracking_ledger` (
    file_id STRING, ingestion_date DATE, status STRING, file_hash STRING
) PARTITION BY ingestion_date;


-- ════════════════════════════════════════════════════════════════════
-- [042] intellectual_fitrah_health
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.intellectual_fitrah_health`
(
    intellectual_trend_id STRING, -- "المعتزلة المتأخرة", "الجمود الفقهي"
    
    -- مقياس الفطرة (ابن تيمية)
    fitrah_compatibility STRUCT<
        agrees_with_sound_reason BOOL, -- موافقة صريح المعقول
        agrees_with_sound_revelation BOOL, -- موافقة صحيح المنقول
        conflict_nature STRING -- "تعارض وهمي", "تعارض حقيقي"
    >,

    -- أمراض العقل (التي سبقت التغريب)
    intellectual_diseases STRUCT<
        sophistry_level STRING, -- (السفسطة) الجدل العقيم
        blind_imitation STRING, -- (التقليد الأعمى)
        esotericism_level STRING, -- (الباطنية) الهروب من الواقع
        dualism_impact STRING -- (فصل الدين عن الحياة - العلمانية الجنينية)
    >,

    -- المناعة
    immunity_score FLOAT64 -- (0-10) قدرة العقل المسلم في هذا العصر على مقاومة الشبهات
)
CLUSTER BY intellectual_trend_id;


-- ════════════════════════════════════════════════════════════════════
-- [043] intellectual_networks_and_communities
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.intellectual_networks_and_communities` (
    network_id STRING, central_figure_id STRING, network_type STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [044] intellectual_schools_bio_model
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.intellectual_schools_bio_model` (
    school_id STRING, 
    school_name STRING, -- Cluster Key
    foundation_date DATE, 
    extinction_date DATE, 
    lifecycle_status STRING, -- Alive, Extinct, Dormant
    survival_factors STRUCT<political_support_level STRING, popular_acceptance STRING>
) CLUSTER BY school_name;


-- ════════════════════════════════════════════════════════════════════
-- [045] interfaith_polemics_and_dialogue
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.interfaith_polemics_and_dialogue` (
    polemic_id STRING, target_religion STRING, argument_text STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [046] israiliyat_and_biblical_narratives
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.israiliyat_and_biblical_narratives`
(
    narrative_id STRING,
    
    -- القصة الدخيلة
    story_theme STRING, -- "Creation", "Prophets_Tales", "End_Times"
    key_characters ARRAY<STRING>, -- يأجوج ومأجوج، هاروت وماروت
    
    -- المصدر والجسر (The Bridge)
    origin_source STRUCT<
        source_tradition STRING, -- "Talmud", "Midrash", "Christian_Apocrypha"
        entry_point_scholar STRING, -- "Ka'b al-Ahbar", "Wahb ibn Munabbih"
        entry_method STRING -- "Oral_Tradition", "Translation"
    >,

    -- التسلل (Infiltration)
    penetration_path STRUCT<
        first_appearance_book STRING, -- أول كتاب إسلامي ذكرها
        tafsir_integration ARRAY<STRING>, -- التفاسير التي "بلعتها" (الطبري، البغوي)
        historian_adoption ARRAY<STRING> -- المؤرخون الذين اعتمدوها
    >,

    -- الموقف النقدي
    scholarly_resistance STRUCT<
        critics ARRAY<STRING>, -- (ابن كثير، ابن حزم)
        refutation_arguments STRING
    >,

    -- الأثر في الوعي
    cultural_impact STRING -- "شكلت صورة الأنبياء في الذهن الشعبي"
)
CLUSTER BY origin_source.entry_point_scholar;


-- ════════════════════════════════════════════════════════════════════
-- [047] israiliyat_narrative_forensics
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.israiliyat_narrative_forensics`
(
  -- 🔑 مفاتيح السطح (للسرعة)
  narrative_id STRING NOT NULL,
  narrative_category STRING,    -- "Biblical", "Talmudic", "Folk"
  entry_scholar_main STRING,    -- "Ka'b", "Wahb"
  match_confidence_score FLOAT64, -- نسبة التطابق الجنائي (0-1)

  -- 📖 1)


-- ════════════════════════════════════════════════════════════════════
-- [048] israiliyat_narrative_infiltration
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.israiliyat_narrative_infiltration`
(
  -- ═══════════════════════════════════════════════════════════════════
  -- 🔑 المفتاح الأساسي
  -- ═══════════════════════════════════════════════════════════════════
  narrative_id STRING NOT NULL,
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 📊 حقول التصنيف الأساسية
  -- ═══════════════════════════════════════════════════════════════════
  narrative_category STRING NOT NULL,       -- "Biblical", "Talmudic", "Midrashic", "Apocryphal"
  infiltration_status STRING NOT NULL,      -- "Deep_Rooted", "Partially_Expelled", "Expelled", "Still_Spreading"
  danger_level STRING NOT NULL,             -- "Critical", "High", "Medium", "Low"
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 📖 1)


-- ════════════════════════════════════════════════════════════════════
-- [049] israiliyat_narrative_infiltration_ultimate
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.israiliyat_narrative_infiltration_ultimate`
(
  -- ═══════════════════════════════════════════════════════════════════
  -- 🔑 المفتاح الأساسي
  -- ═══════════════════════════════════════════════════════════════════
  narrative_id STRING NOT NULL,
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 📊 حقول التصنيف الأساسية
  -- ═══════════════════════════════════════════════════════════════════
  narrative_category STRING NOT NULL,
  infiltration_status STRING NOT NULL,
  danger_level STRING NOT NULL,
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 📖 1)


-- ════════════════════════════════════════════════════════════════════
-- [050] kalam_and_theological_schools
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.kalam_and_theological_schools` (
    school_id STRING, theology_name STRING, key_principles ARRAY<STRING>
);


-- ════════════════════════════════════════════════════════════════════
-- [051] legal_and_administrative_decrees
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.legal_and_administrative_decrees` (
    decree_id STRING, issue_date DATE, decree_content STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [052] libraries_and_book_collections
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.libraries_and_book_collections (
  library_id STRING NOT NULL,
  
  -- الموقع والزمان
  location_id STRING,
  foundation_date DATE,
  end_date DATE,                        -- destruction/dispersal
  
  -- النوع
  library_type STRING,                  -- royal/madrasa/mosque/private/hospital
  
  -- المحتويات (Reconstruction)
  holdings STRUCT<
    estimated_size INT64,
    known_titles ARRAY<STRING>,         -- FK → book_metadata_registry
    subject_distribution STRUCT<
      fiqh_percentage FLOAT64,
      philosophy_percentage FLOAT64,
      science_percentage FLOAT64
      -- etc
    >,
    notable_manuscripts ARRAY<STRING>
  >,
  
  -- الإدارة
  administration STRUCT<
    librarians ARRAY<STRING>,
    lending_policy STRING,
    funding_source STRING
  >,
  
  -- المصير
  fate STRUCT<
    destruction_event STRING,           -- fire/flood/invasion/theft
    dispersal_pattern STRING
  >,
  
  metadata STRUCT<
    source_of_info STRING               -- fihrist/waqfiyya/historian_account
  >
)
PARTITION BY foundation_date
CLUSTER BY library_type, location_id;


-- ════════════════════════════════════════════════════════════════════
-- [053] linguistic_stylistic_evolution
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.linguistic_stylistic_evolution ( linguistic_record_id STRING NOT NULL, -- العينة sample STRUCT text_id STRING, -- FK → texts_full_corpus text_segment STRING, author_id STRING, -- التوقيت composition_date DATE, century_hijri STRING, -- التصنيف genre STRING, subject_area STRING >, -- التحليل المعجمي lexical_analysis STRUCT -- الثروة اللغوية vocabulary_richness STRUCT type_token_ratio FLOAT64, -- نسبة الكلمات المتميزة/الكلمات الكلية hapax_legomena_ratio FLOAT64, -- نسبة الكلمات التي تظهر مرة واحدة -- التنوع lexical_diversity_index FLOAT64, -- التفسير richness_assessment STRING -- very_rich/rich/average/limited/poor >>, -- الاقتراض اللغوي borrowings STRUCT -- من لغات أخرى foreign_terms ARRAY<STRUCT term STRING, source_language STRING, -- Greek/Persian/Syriac/Sanskrit term_category STRING, -- technical/philosophical/administrative/everyday -- الاندماج integration_level STRING, -- fully_integrated/partially/alien -- المعادل العربي arabic_equivalent STRING, equivalent_used BOOLEAN >>, -- النسبة الإجمالية borrowing_percentage FLOAT64 >>, -- النيولوجيسم (الكلمات المُبتكرة) neologisms ARRAY<STRUCT new_term STRING, coinage_method STRING, -- derivation/compounding/calque/pure_invention acceptance_level STRING, -- الانتشار diffusion STRING >>, -- الألفاظ المميزة distinctive_vocabulary ARRAY<STRUCT term STRING, frequency INT64, distinctiveness_score FLOAT64, -- مقارنة بالمعاصرين -- الدلالة semantic_field STRING >> >, -- التحليل النحوي والصرفي grammatical_analysis STRUCT -- التراكيب syntactic_patterns STRUCT -- تعقيد الجملة sentence_complexity STRUCT avg_sentence_length FLOAT64, avg_clause_depth INT64, complexity_index FLOAT64, complexity_assessment STRING -- very_complex/complex/moderate/simple >>, -- أنماط التركيب construction_patterns ARRAY<STRUCT pattern_type STRING, -- nominal/verbal/conditional/passive frequency FLOAT64, deviation_from_norm FLOAT64 -- مقارنة بالمعاصرين >>, -- الانحرافات النحوية deviations ARRAY<STRUCT deviation_type STRING, frequency STRING, intentional BOOLEAN, -- خطأ أم أسلوب؟ effect STRING >> >>, -- الصيغ الصرفية morphological_patterns STRUCT -- الأوزان المفضلة preferred_patterns ARRAY<STRING>, -- الابتكارات الصرفية morphological_innovations ARRAY<STRING> >> >, -- التحليل الأسلوبي stylistic_analysis STRUCT -- السمات الأسلوبية stylistic_features STRUCT -- البلاغة rhetorical_devices ARRAY<STRUCT device_name STRING, -- metaphor/simile/antithesis/parallelism frequency FLOAT64, effectiveness_assessment STRING >>, -- السجع والجناس phonetic_devices STRUCT rhyme_frequency FLOAT64, alliteration_frequency FLOAT64, assonance_frequency FLOAT64, overall_assessment STRING -- highly_ornate/balanced/plain >>, -- الإيقاع rhythm STRUCT rhythm_type STRING, rhythm_regularity STRING, rhythm_effect STRING >> >>, -- الوضوح vs الغموض clarity STRUCT clarity_level STRING, -- crystal_clear/clear/ambiguous/obscure/deliberately_obscure -- مصادر الغموض ambiguity_sources ARRAY<STRING>, -- technical_jargon/ellipsis/allusion/mystical -- النية intended_audience_clarity STRING >>, -- التوقيع الأسلوبي (Stylometric Signature) stylometric_signature STRUCT signature_vector ARRAY<FLOAT64>, -- للتعرف الآلي -- السمات المميزة distinctive_markers ARRAY<STRING>, -- التشابه مع آخرين similarity_to_others ARRAY<STRUCT author_id STRING, similarity_score FLOAT64 >> >> >, -- التحليل المقارن comparative_analysis STRUCT -- مقارنة زمنية temporal_comparison STRUCT -- مع السابقين comparison_with_predecessors STRUCT innovations ARRAY<STRING>, continuities ARRAY<STRING>, regressions ARRAY<STRING> >>, -- مع المعاصرين comparison_with_contemporaries STRUCT similarities ARRAY<STRING>, differences ARRAY<STRING>, distinctiveness_score FLOAT64 >> >>, -- مقارنة مكانية regional_comparison STRUCT regional_features ARRAY<STRING>, dialect_influences ARRAY<STRING> >> >, -- التطور والتحول evolution STRUCT -- المرحلة الأسلوبية stylistic_period STRING, -- early_formative/classical/baroque/decadent/revival -- التحولات changes_detected ARRAY<STRUCT change_type STRING, -- lexical/syntactic/rhetorical change_description STRING, change_date DATE, -- الأسباب drivers ARRAY<STRING> -- genre_shift/audience_change/influence/aging/crisis >>, -- الاتجاه overall_trend STRING -- simplification/complexification/stabilization/fragmentation >, -- الأثر التواصلي communicative_effect STRUCT -- الوضوح الفعلي actual_clarity STRING, -- القابلية للفهم comprehensibility STRUCT for_contemporaries STRING, for_later_readers STRING, for_non_specialists STRING >>, -- القوة الإقناعية persuasive_power STRING, -- الجاذبية الأدبية literary_appeal STRING >, related_entities STRUCT related_authors ARRAY<STRING>, related_texts ARRAY<STRING>, influenced_by ARRAY<STRING>, influenced ARRAY<STRING> >, metadata STRUCT analysis_method STRING, -- manual/computational/mixed analysis_tools ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)CLUSTER BY sample.century_hijri, sample.genre;


-- ════════════════════════════════════════════════════════════════════
-- [054] macro_economic_and_population_stats
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.macro_economic_and_population_stats` (
    stat_id STRING, 
    year_gregorian INT64, -- Cluster Key
    region STRING, 
    population_estimate INT64, 
    gdp_estimate FLOAT64, 
    currency_value_index FLOAT64
) CLUSTER BY year_gregorian;


-- ════════════════════════════════════════════════════════════════════
-- [055] manuscript_production_and_economy
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.manuscript_production_and_economy (
  manuscript_id STRING
NOT NULL,
  production_date DATE
NOT NULL,
  location_id STRING,
 
  physical_description
STRUCT
    dimensions STRUCT
      height_cm
FLOAT64,
      width_cm FLOAT64,
      thickness_cm
FLOAT64
    >,
   
    materials STRUCT
      paper_type
STRING,              --
baghdadi/damascene/european
      paper_quality
STRING,
     paper_cost_estimate FLOAT64,
     
      ink_type STRING,
      ink_color STRING,
     
      binding_type
STRING,
      binding_materials
ARRAY<STRING>
    >,
   
    script STRUCT
      script_type
STRING,             --
naskh/muhaqqaq/riqa
      script_quality
STRING,
     illumination_level STRING,      --
none/basic/moderate/elaborate
     
     number_of_lines_per_page INT64,
      number_of_pages
INT64
    >
  >,
 
  -- الإنتاج
  production_process
STRUCT
    copyist STRUCT
      copyist_id
STRING,
      copyist_name
STRING,
     copyist_reputation STRING
    >,
   
   production_location STRING,       --
royal_library/madrasa/private_workshop/home
   
   production_time_days INT64,
   
    -- التكلفة
    production_cost
STRUCT
      materials_cost
FLOAT64,
      labor_cost
FLOAT64,
      overhead_cost
FLOAT64,
      total_cost
FLOAT64,
      currency STRING
    >,
   
    patron STRUCT
      patron_id STRING,
      patron_name
STRING,
     patron_motivation STRING
    >
  >,
 
  -- التداول
  circulation STRUCT
    original_owner
STRING,
   
    ownership_history
ARRAY<STRUCT
      owner_name
STRING,
      acquisition_date
DATE,
     acquisition_method STRING,      --
purchase/gift/inheritance/waqf
      price_paid
FLOAT64
    >>,
   
    current_location
STRING,          --
library/museum/private/lost
   
   reading_annotations BOOLEAN,
    waqf_inscription BOOLEAN
  >,
 
  -- القيمة
  valuation STRUCT
   market_value_at_production FLOAT64,
   current_market_value FLOAT64,
   
    value_drivers
ARRAY<STRING>,      --
age/rarity/author/calligraphy/provenance
   
   cultural_significance STRING
  >,
 
  related_entities
STRUCT
    related_text_id
STRING,           -- FK → texts
    related_author_id
STRING,         -- FK → scholars
    related_patron_id
STRING,         -- FK →
rulers/scholars
    related_waqf_id
STRING            -- FK →
waqf_and_philanthropy_network
  >
)
PARTITION BY production_date
CLUSTER BY production_process.production_location,
physical_description.script.script_type;


-- ════════════════════════════════════════════════════════════════════
-- [056] marginalia_and_commentary_tradition
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.marginalia_and_commentary_tradition (
  marginalia_id STRING NOT NULL,
  
  -- النص الأصل
  base_text_id STRING,                  -- FK → book_metadata_registry
  
  -- نص الهامش/الشرح
  commentary_text_id STRING,            -- FK if it's a standalone book
  author_id STRING,
  date_of_composition DATE,
  
  -- النوع
  type STRING,                          -- sharh/hashiya/ta'liq/mukhtasar/radd
  
  -- العلاقة بالنص الأصلي
  relationship_type STRUCT<
    stance STRING,                      -- supportive/critical/explanatory/expanding
    focus STRING,                       -- linguistic/legal/theological/logical
    methodology STRING
  >,
  
  -- المحتوى
  key_arguments ARRAY<STRING>,
  new_concepts_introduced ARRAY<STRING>,
  
  -- السياق المادي (للهوامش المخطوطة)
  manuscript_context STRUCT<
    manuscript_id STRING,
    location_on_page STRING,            -- margin/interlinear/end_page
    handwriting_style STRING
  >,
  
  metadata STRUCT<
    significance_score FLOAT64
  >
)
PARTITION BY date_of_composition
CLUSTER BY type, base_text_id;


-- ════════════════════════════════════════════════════════════════════
-- [057] master_entity_index
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.master_entity_index`
(
    entity_id STRING NOT NULL, -- المعرف الموحد
    entity_type STRING, -- Scholar, Book, Event, Location, Concept
    
    -- الأسماء المختلفة للكيان
    primary_name STRING,
    alternative_names ARRAY<STRING>,
    
    -- المصدر
    source_table STRING,
    
    -- التزمين الموحد (للبحث الزمني السريع)
    start_date DATE,
    end_date DATE,
    
    -- الموقع الموحد
    location_geo GEOGRAPHY,
    
    -- العلاقات السريعة (للرسم الشبكي)
    related_entity_ids ARRAY<STRING>
)
PARTITION BY DATE_TRUNC(start_date, YEAR)
CLUSTER BY entity_type;


-- ════════════════════════════════════════════════════════════════════
-- [058] methodological_hub
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.methodological_hub (
  method_id STRING NOT NULL,
  
  -- المنهج
  method_info STRUCT
    method_name STRING,                  -- rational_argumentation/textual_interpretation/empirical_observation
    method_type STRING,                  -- epistemic/hermeneutic/procedural
    
    description STRING,
    
    -- المجال
    applicable_domains ARRAY<STRING>     -- theology/law/medicine/astronomy
  >,
  
  -- المكونات
  components STRUCT
    -- الأسس المعرفية
    epistemological_foundations ARRAY<STRING>,
    
    -- الأدوات
    tools ARRAY<STRUCT
      tool_name STRING,
      tool_function STRING
    >>,
    
    -- الإجراءات
    procedures ARRAY<STRUCT
      step_number INT64,
      step_description STRING,
      justification STRING
    >>
  >,
  
  -- معايير التقييم
  evaluation_criteria STRUCT
    validity_criteria ARRAY<STRING>,
    reliability_criteria ARRAY<STRING>,
    
    -- العتبات
    thresholds STRUCT
      minimum_evidence STRING,
      confidence_threshold FLOAT64
    >>
  >,
  
  -- التبني والانتشار
  adoption STRUCT
    -- من يستخدمه؟
    adopters ARRAY<STRUCT
      adopter_id STRING,                 -- FK → author_profiles
      adoption_date DATE,
      proficiency_level STRING
    >>,
    
    -- المدارس
    schools_using_it ARRAY<STRING>,      -- FK → intellectual_schools
    
    -- الانتشار
    prevalence STRUCT
      by_period ARRAY<STRUCT
        period STRING,
        prevalence_level STRING
      >>
    >>
  >,
  
  -- الربط بالمحاور الأخرى
  cross_hub_links STRUCT
    -- البشري
    practitioners ARRAY<STRING>,         -- FK → author_profiles (من يُتقنه؟)
    
    -- النصي
    exemplary_texts ARRAY<STRING>,       -- FK → texts (نصوص تجسده)
    
    -- المفاهيمي
    related_concepts ARRAY<STRING>,      -- FK → concepts (مفاهيم منهجية)
    
    -- الزمكاني
    emergence_context STRUCT
      emergence_date DATE,
      emergence_location STRING,
      emergence_circumstances STRING
    >>
  >,
  
  -- التحولات
  evolution STRUCT
    changes ARRAY<STRUCT
      change_date DATE,
      change_description STRING,
      change_drivers ARRAY<STRING>
    >>,
    
    -- الأزمات المنهجية
    crises ARRAY<STRUCT
      crisis_id STRING,                  -- FK → epistemic_crises
      crisis_description STRING,
      resolution STRING
    >>
  >,
  
  metadata STRUCT
    created_at TIMESTAMP,
    curator_notes STRING
  >
)
CLUSTER BY method_info.method_type, adoption.prevalence.by_period;


-- ════════════════════════════════════════════════════════════════════
-- [059] model_validation_registry
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.model_validation_registry ( validation_id STRING NOT NULL, -- Model Being Tested model_reference STRUCT model_type STRING, -- behavioral_rule/dynamics_equation/causal_link/forecast model_id STRING, model_description STRING >, -- Validation Method validation_method STRUCT method_type STRING, -- historical_backtesting/cross_validation/holdout/external_validation -- Test Design test_design STRUCT test_period STRUCT start_date DATE, end_date DATE >>, -- What are we testing? hypothesis STRING, -- Success criteria success_criteria ARRAY<STRUCT criterion STRING, threshold FLOAT64 >> >> >, -- Test Results test_results STRUCT test_date TIMESTAMP, -- Quantitative Results metrics STRUCT accuracy FLOAT64, precision FLOAT64, recall FLOAT64, f1_score FLOAT64, -- For regression r_squared FLOAT64, rmse FLOAT64, -- Custom metrics custom_metrics JSON >>, -- Pass/Fail passed BOOLEAN, -- Detailed Results detailed_results JSON, -- Comparison with Baseline baseline_comparison STRUCT baseline_model STRING, improvement FLOAT64, -- % better than baseline statistical_significance FLOAT64 -- p-value >> >, -- Failure Analysis (if failed) failure_analysis STRUCT failure_patterns ARRAY<STRING>, -- Where it fails failure_regions ARRAY<STRUCT region_description STRING, -- "high volatility periods", "regime shifts" failure_rate FLOAT64 >>, -- Hypothesized Reasons hypothesized_causes ARRAY<STRING>, -- Suggested Fixes suggested_improvements ARRAY<STRING> >, -- Robustness Checks robustness_checks ARRAY<STRUCT check_type STRING, -- sensitivity/perturbation/stress_test check_description STRING, result STRING, passed BOOLEAN >>, -- Meta-Validation meta_validation STRUCT external_reviewers ARRAY<STRING>, peer_review_status STRING, replication_attempts INT64, replications_successful INT64 >, metadata STRUCT validated_by STRING, validation_date TIMESTAMP, next_validation_due DATE >)CLUSTER BY model_reference.model_type, test_results.passed;


-- ════════════════════════════════════════════════════════════════════
-- [060] necessity_driven_innovation
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.necessity_driven_innovation`
(
    innovation_id STRING,
    appearance_year INT64,
    
    -- [المحفز: الأزمة]
    triggering_necessity STRUCT<
        crisis_type STRING, -- (شح مياه، إفلاس تجار، تعقيد مواريث)
        severity_level STRING,
        affected_population STRING
    >,
    
    -- [الاستجابة: الاختراع]
    invented_solution STRUCT<
        solution_type STRING, -- (آلة ميكانيكية، حيلة فقهية، نظام محاسبي)
        description STRING,
        innovator_id STRING
    >,
    
    -- [دورة الحياة]
    adoption_cycle STRUCT<
        resistance_faced STRING, -- (هل حرمها الفقهاء أولاً؟)
        time_to_acceptance INT64 -- كم سنة حتى أصبحت "عرفاً"؟
    >
)
PARTITION BY RANGE_BUCKET(appearance_year, GENERATE_ARRAY(0, 1500, 50))
CLUSTER BY triggering_necessity.crisis_type;


-- ════════════════════════════════════════════════════════════════════
-- [061] neoplatonic_infiltration_police
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.neoplatonic_infiltration_police`
(
  -- ═══════════════════════════════════════════════════════════════════
  -- 🔑 المفتاح الأساسي
  -- ═══════════════════════════════════════════════════════════════════
  case_id STRING NOT NULL,                  -- رقم القضية البوليسية!
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 📊 حقول التصنيف والتحقيق
  -- ═══════════════════════════════════════════════════════════════════
  infiltration_type STRING NOT NULL,        -- "Concept", "Terminology", "Argument_Structure", "Worldview"
  target_field STRING NOT NULL,             -- "Tasawwuf", "Kalam", "Falsafa", "Usul_Fiqh", "Tafsir", "Adab"
  danger_level STRING NOT NULL,             -- "Critical", "High", "Medium", "Low"
  detection_status STRING NOT NULL,         -- "Confirmed", "Highly_Probable", "Suspected", "Under_Investigation"
  
  theological_severity STRING,              -- "Kufr", "Bid'ah_Muharramah", "Bid'ah_Makruhah", "Problematic", "Tolerable"
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 🎯 1)


-- ════════════════════════════════════════════════════════════════════
-- [062] non_textual_archive_and_artifacts
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.non_textual_archive_and_artifacts`
(
    artifact_id STRING,
    creation_date DATE,
    
    -- [نوع الأثر]
    artifact_category STRING, -- (Numismatics, Textiles, Miniatures, Ceramics)
    
    -- [تحليل العملات والشعارات]
    numismatics_data STRUCT<
        coin_metal STRING, -- (ذهب، فضة، نحاس مغشوش = أزمة اقتصادية)
        political_slogans STRING, -- (الآيات المكتوبة على السكة تعكس العقيدة الرسمية)
        ruler_title_on_coin STRING
    >,
    
    -- [تحليل الصور والأزياء]
    visual_culture_data STRUCT<
        depicted_scenes ARRAY<STRING>, -- (مجلس طرب، صيد، حرب)
        clothing_details STRING, -- (تطور الزي كدليل على التغير الاجتماعي)
        forbidden_imagery_flag BOOL -- (هل تخالف الشريعة الرسمية؟)
    >,
    
    -- [الدلالة التاريخية]
    implied_history STRING -- ما الذي تقوله هذه القطعة ولم يقله الكتاب؟
)
PARTITION BY DATE_TRUNC(creation_date, YEAR)
CLUSTER BY artifact_category;


-- ════════════════════════════════════════════════════════════════════
-- [063] notes
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.smart_notebook.notes (
note_id STRING NOT NULL,
user_id STRING NOT NULL,
created_at TIMESTAMP NOT NULL,
-- المحتوى
content STRUCT
raw_text STRING, -- النص الأصلي
cleaned_text STRING, -- بعد التنظيف
source_type STRING, -- "text", "voice", "image"
voice_file_url STRING, -- رابط الصوت الأصلي (إن وجد)
language STRING -- "ar", "en", "mixed"
>,
-- التصنيف
classification STRUCT
note_type STRING, -- "idea", "task", "question", "observation", "decision"
project STRING, -- "iqra12", "tarjuman", "identity"...
tags ARRAY<STRING>, -- وسوم ذكية
confidence FLOAT64, -- ثقة التصنيف التلقائي
user_confirmed BOOL -- هل أكد المستخدم؟
>,
-- السياق
context STRUCT
session_id STRING, -- جلسة البحث
related_query STRING, -- السؤال الذي كان يبحث عنه
time_of_day STRING, -- "morning", "afternoon", "night"
device STRING -- "whatsapp", "web", "api"
>,
-- المعالجة
processing STRUCT
summary STRING, -- تلخيص في سطر
extracted_tasks ARRAY<STRING>,
extracted_decisions ARRAY<STRING>,
extracted_questions ARRAY<STRING>,
embeddings ARRAY<FLOAT64> -- للبحث الدلالي
>,
-- الحالة
status STRUCT
is_processed BOOL, -- هل تمت معالجتها؟
is_acted_upon BOOL, -- هل تم التصرف فيها؟
is_archived BOOL,
reminder_sent BOOL,
last_accessed TIMESTAMP
>,
-- الروابط
links STRUCT
parent_note_id STRING, -- إذا كانت رداً على ملاحظة
related_notes ARRAY<STRING>, -- ملاحظات مرتبطة
generated_tasks ARRAY<STRING>,-- مهام نتجت عنها
iqra_queries ARRAY<STRING> -- استعلامات أرسلت لإقرأ
>
)
PARTITION BY DATE(created_at)
CLUSTER BY user_id, classification.project;


-- ════════════════════════════════════════════════════════════════════
-- [064] openiti_staging_buffer
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.openiti_staging_buffer`
(
    file_id STRING OPTIONS(description="اسم الملف الأصلي"),
    author_uri STRING,
    book_title STRING,
    death_date INT64,
    
    -- هنا يوضع النص الخام كاملاً قبل التحليل
    full_raw_text STRING,
    
    -- الميتاداتا المستخلصة من رأس الملف
    metadata_header STRING,
    
    -- طابع زمني للحفظ
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY RANGE_BUCKET(death_date, GENERATE_ARRAY(0, 1500, 50))
CLUSTER BY author_uri;


-- ════════════════════════════════════════════════════════════════════
-- [065] pedagogical_practices_and_learning
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.pedagogical_practices_and_learning ( teaching_record_id STRING NOT NULL, -- السياق period STRING, institution_id STRING, -- FK → institutions_registry -- المعلم teacher STRUCT teacher_id STRING, -- FK → author_profiles_master teacher_name STRING, -- الأسلوب teaching_style STRUCT style_type STRING, -- authoritarian/dialogical/socratic/mystical distinctive_features ARRAY<STRING>, -- الشخصية personality_traits ARRAY<STRING>, -- patient/strict/charismatic/aloof -- التقييم من الطلاب student_perception STRING >>, -- التدريب البيداغوجي pedagogical_training STRUCT formal_training BOOLEAN, learning_by_doing STRING, mentors ARRAY<STRING> >> >, -- الطلاب students STRUCT -- الديموغرافيا demographics STRUCT typical_number INT64, age_range STRING, social_background ARRAY<STRING>, geographical_origins ARRAY<STRING>, -- التنوع diversity_level STRING >>, -- المستوى student_level STRING, -- beginner/intermediate/advanced -- التحضير المسبق prerequisites ARRAY<STRING>, -- الطلاب البارزون notable_students ARRAY<STRUCT student_id STRING, achievements STRING, -- شهادتهم عن المعلم testimony STRING >> >, -- المادة المُدرَّسة subject_matter STRUCT subject_name STRING, text_studied STRING, -- FK → book_metadata_registry -- العمق coverage_depth STRING, -- comprehensive/selective/cursory -- التسلسل sequence_logic STRING, -- linear/spiral/thematic -- الصعوبة difficulty_progression STRING >, -- الطريقة التعليمية teaching_methods STRUCT -- الطرق المستخدمة methods ARRAY<STRUCT method_name STRING, -- lecture/reading_aloud/dictation/memorization/discussion/questioning/demonstration frequency STRING, effectiveness_assessment STRING >>, -- البنية النموذجية للدرس typical_lesson_structure STRUCT duration_minutes INT64, phases ARRAY<STRUCT phase_name STRING, -- opening/review/new_material/discussion/practice/closing duration_minutes INT64, activities ARRAY<STRING> >>, -- الوتيرة pacing STRING >>, -- التقنيات التفاعلية interactive_techniques ARRAY<STRUCT technique STRING, -- questioning/debate/role_play/group_work/problem_solving purpose STRING, student_participation_level STRING >> >, -- الأدوات والمواد tools_and_materials STRUCT -- المواد المكتوبة written_materials ARRAY<STRUCT material_type STRING, -- textbook/notes/summaries/commentaries availability STRING, -- abundant/scarce/teacher_only quality STRING >>, -- الأدوات البصرية visual_aids ARRAY<STRING>, -- diagrams/models/astronomical_instruments -- الفضاء المادي physical_setting STRUCT room_type STRING, seating_arrangement STRING, -- circle/rows/informal acoustic_quality STRING, -- المشتتات distractions ARRAY<STRING> >> >, -- التقييم والاختبار assessment STRUCT -- الطرق assessment_methods ARRAY<STRUCT method STRING, -- oral_exam/written_test/demonstration/memorization_check/disputation frequency STRING, weight FLOAT64 -- أهمية نسبية >>, -- المعايير grading_criteria STRUCT explicit_criteria ARRAY<STRING>, implicit_criteria ARRAY<STRING>, -- القسوة stringency_level STRING, -- الموضوعية objectivity_level STRING -- objective/subjective/inconsistent >>, -- معدل النجاح success_rate STRUCT pass_rate_estimate FLOAT64, -- العوامل المؤثرة factors_affecting_success ARRAY<STRING>, -- الفشل failure_handling STRUCT failure_rate FLOAT64, failure_consequences STRING, remediation_options ARRAY<STRING> >> >> >, -- استراتيجيات التعلم learning_strategies STRUCT -- ما يُشجع عليه encouraged_strategies ARRAY<STRUCT strategy STRING, -- memorization/understanding/questioning/imitation/independent_thinking emphasis_level STRING >>, -- ما يُثبط discouraged_behaviors ARRAY<STRING>, -- التكيف مع أنماط التعلم adaptation_to_learning_styles STRUCT is_adaptive BOOLEAN, how_adapted STRING >> >, -- التحديات والصعوبات challenges STRUCT -- تحديات المعلم teacher_challenges ARRAY<STRUCT challenge STRING, frequency STRING, coping_strategy STRING >>, -- تحديات الطلاب student_difficulties ARRAY<STRUCT difficulty_type STRING, -- linguistic/conceptual/motivational/material prevalence STRING, support_provided STRING >>, -- المشاكل السلوكية behavioral_issues ARRAY<STRUCT issue STRING, frequency STRING, resolution STRING >> >, -- الأثر والنتائج outcomes STRUCT -- التعلم الفعلي learning_outcomes ARRAY<STRUCT outcome STRING, achievement_level STRING, -- exceeded/met/partially_met/not_met -- الأدلة evidence ARRAY<STRING> >>, -- ما وراء المعرفة meta_outcomes ARRAY<STRING>, -- critical_thinking/love_of_learning/method_acquisition -- التأثير طويل المدى long_term_impact STRUCT career_impact STRING, intellectual_impact STRING, -- شهادات الخريجين alumni_testimonials ARRAY<STRING> >> >, -- الابتكارات البيداغوجية pedagogical_innovations ARRAY<STRUCT innovation_description STRING, innovator STRING, adoption_rate STRING, effectiveness STRING >>, -- المقارنة comparative_analysis STRUCT -- مقارنة مع معلمين آخرين comparison_teachers ARRAY<STRUCT teacher_id STRING, similarities ARRAY<STRING>, differences ARRAY<STRING> >>, -- مقارنة مع مدارس أخرى comparison_institutions ARRAY<STRUCT institution_id STRING, pedagogical_differences STRING >> >, related_entities STRUCT related_teachers ARRAY<STRING>, related_students ARRAY<STRING>, related_institutions ARRAY<STRING>, related_texts ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, -- autobiographies/biographies/student_notes/institutional_records confidence_level STRING, curator_notes STRING >)CLUSTER BY institution_id, period;


-- ════════════════════════════════════════════════════════════════════
-- [066] political_eras_and_dynasties
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.political_eras_and_dynasties` (
    era_id STRING, start_year INT64, dynasty_name STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [067] popular_pressure_and_scholarly_silence
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.popular_pressure_and_scholarly_silence`
(
    incident_id STRING,
    event_date DATE,
    region_id STRING,
    
    -- [مصيدة الضغط العام]
    mob_pressure STRUCT<
        pressure_type STRING, -- (رجم، تشهير، تهمة زندقة، مقاطعة)
        target_scholar STRING, -- (من العالم المستهدف؟)
        triggering_issue STRING -- (إنكار كرامة، مسألة في الصفات، رفع سعر)
    >,
    
    -- [مصيدة الاستجابة]
    scholarly_reaction STRUCT<
        reaction_type STRING, -- (تراجع عن فتوى، هروب من المدينة، صمت، مداهنة)
        textual_evidence STRING -- (نص التراجع أو الاعتذار)
    >,
    
    -- [المجال المغناطيسي]
    taboo_topics STRUCT<
        forbidden_subjects ARRAY<STRING>, -- المواضيع التي أصبح "الحديث فيها خطيراً"
        duration_of_silence INT64 -- كم سنة استمر المنع العرفي؟
    >
)
PARTITION BY DATE_TRUNC(event_date, YEAR)
CLUSTER BY mob_pressure.triggering_issue;


-- ════════════════════════════════════════════════════════════════════
-- [068] popular_religion_and_folk_practices
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.popular_religion_and_folk_practices (
  practice_id STRING NOT
NULL,
  observation_date DATE
NOT NULL,
  location_id STRING,
 
  practice_info STRUCT
    practice_name
STRING,
    practice_type
STRING,              --
saint_veneration/folk_ritual/healing_practice/divination
   practice_description STRING,
   
    -- الأصل
    practice_origin
STRUCT
      indigenous BOOLEAN,
      borrowed_from
STRING,            --
pre_islamic/christian/jewish/local_pagan
      syncretism_level
STRING          --
pure/mixed/highly_syncretic
    >
  >,
 
  -- العلاقة بالإسلام الرسمي
 relationship_with_orthodoxy STRUCT
    official_stance
STRING,            --
approved/tolerated/contested/condemned
    scholarly_opinions
ARRAY<STRUCT
      scholar_id
STRING,
      opinion STRING,
      rationale STRING
    >>,
   
    -- التوتر
    tension_level
STRING,              --
harmonious/low_tension/high_tension/conflictual
   
    -- محاولات القمع
   suppression_attempts ARRAY<STRUCT
      attempt_date DATE,
     suppressing_authority STRING,
      methods ARRAY<STRING>,
      outcome STRING
    >>
  >,
 
  -- الانتشار الاجتماعي
  social_penetration
STRUCT
    prevalence STRING,                 --
universal/widespread/common/niche
    social_classes
ARRAY<STRING>,
    gender_specificity
STRING,
   
   geographic_distribution ARRAY<STRING>
  >,
 
  related_entities
STRUCT
    related_scholars
ARRAY<STRING>,
   related_sufi_orders ARRAY<STRING>,
    related_events
ARRAY<STRING>
  >
)
PARTITION BY observation_date
CLUSTER BY practice_info.practice_type, location_id;


-- ════════════════════════════════════════════════════════════════════
-- [069] precomputed_query_paths
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.precomputed_query_paths (
  path_id STRING NOT NULL,
  
  -- السؤال
  query_pattern STRUCT
    pattern_type STRING,                 -- why_extinct/how_spread/who_influenced/what_caused
    pattern_template STRING,             -- معرف عام للنمط
    
    -- المتغيرات
    variables ARRAY<STRUCT
      variable_name STRING,
      variable_type STRING
    >>
  >,
  
  -- المسار المحسوب
  computed_path STRUCT
    -- الجداول المطلوبة
    required_tables ARRAY<STRUCT
      table_name STRING,
      join_condition STRING,
      filter_conditions ARRAY<STRING>
    >>,
    
    -- الترتيب الأمثل
    optimal_join_order ARRAY<STRING>,
    
    -- SQL محسّن
    optimized_query_template STRING
  >,
  
  -- النتائج المخزنة مؤقتاً (Cache)
  cached_results STRUCT
    -- للأمثلة الشائعة
    common_examples ARRAY<STRUCT
      example_parameters JSON,
      result_summary JSON,
      result_cached_at TIMESTAMP,
      
      -- الصلاحية
      cache_valid_until TIMESTAMP
    >>
  >,
  
  -- الإحصائيات
  usage_stats STRUCT
    times_used INT64,
    avg_execution_time_ms FLOAT64,
    last_used TIMESTAMP
  >,
  
  metadata STRUCT
    created_at TIMESTAMP,
    last_optimized TIMESTAMP
  >
)
CLUSTER BY query_pattern.pattern_type, usage_stats.times_used DESC;


-- ════════════════════════════════════════════════════════════════════
-- [070] precomputed_query_paths_cache
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.precomputed_query_paths_cache`
(
    path_id STRING,
    query_pattern_type STRING, -- Why_Extinct, Who_Influenced
    
    -- المعاملات
    query_params JSON, -- {school: "Zahiri", region: "East"}
    
    -- النتيجة الجاهزة
    cached_result JSON, 
    
    -- الصلاحية
    last_updated TIMESTAMP,
    valid_until TIMESTAMP
)
CLUSTER BY query_pattern_type;


-- ════════════════════════════════════════════════════════════════════
-- [071] quranic_laws_of_history
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.quranic_laws_of_history`
(
    law_id STRING,
    law_name STRING, -- "سنة التداول", "سنة الترف", "سنة الإملاء", "سنة التدافع"
    
    -- التعريف القرآني
    quranic_definition STRUCT<
        key_verses ARRAY<STRING>, -- الآيات المؤسسة
        conditions_of_activation ARRAY<STRING>, -- متى تعمل هذه السنة؟ (مثلاً: عند شيوع الظلم)
        expected_outcome STRING -- النتيجة الحتمية (هلاك، استبدال)
    >,

    -- التطبيق التاريخي (الرصد)
    historical_manifestations ARRAY<STRUCT<
        event_id STRING, -- FK -> timeline
        era_name STRING, -- "سقوط بغداد"
        match_degree FLOAT64, -- إلى أي مدى انطبقت السنة؟
        analysis_notes STRING -- "سقطت بسبب الترف والظلم الداخلي وليس فقط الغزو"
    >>,

    -- المؤشرات القياسية
    indicators STRUCT<
        warning_signs ARRAY<STRING>, -- علامات قرب وقوع السنة
        preventive_measures ARRAY<STRING> -- كيف تتقى؟
    >
)
CLUSTER BY law_name;


-- ════════════════════════════════════════════════════════════════════
-- [072] qussas_and_oral_culture
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.qussas_and_oral_culture`
(
    storyteller_id STRING,
    active_era_id STRING,
    
    -- [بروفايل القاص]
    performer_profile STRUCT<
        name STRING,
        performance_venue STRING, -- (مسجد، سوق، مقبرة، قصر)
        popularity_index STRING -- (تقدير حجم الجمهور)
    >,
    
    -- [المحتوى والأثر]
    narrative_content STRUCT<
        themes ARRAY<STRING>, -- (ملاحم، إسرائيليات، ترغيب وترهيب، بكائيات)
        source_material STRING, -- (من أين يأتي بالقصص؟)
        conflict_with_jurists BOOL -- هل حاربه الفقهاء (مثل ابن الجوزي)؟
    >,
    
    -- [الأثر في النخبة]
    influence_on_elite STRUCT<
        did_scholars_attend BOOL, -- هل حضر له علماء (ولو متخفين)؟
        concepts_infiltrated STRING -- أفكار عامية تسللت لكتب العقائد
    >
)
PARTITION BY RANGE_BUCKET(CAST(active_era_id AS INT64), GENERATE_ARRAY(0, 1500, 50))
CLUSTER BY performer_profile.performance_venue;


-- ════════════════════════════════════════════════════════════════════
-- [073] readership_and_audience_analysis
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.readership_and_audience_analysis ( readership_record_id STRING NOT NULL, -- النص text_id STRING, -- FK → book_metadata_registry text_title STRING, author_id STRING, -- الفترة الزمنية period STRING, period_century_hijri STRING, -- الجمهور المستهدف (من المؤلف) intended_audience STRUCT target_group STRING, -- scholars/students/rulers/general_public target_level STRING, -- advanced/intermediate/beginner -- الأدلة evidence_of_intent ARRAY<STRUCT evidence_type STRING, -- preface/dedication/language_level/examples evidence_description STRING >> >, -- القراء الفعليون actual_readership STRUCT -- التقدير الكمي estimated_readers STRUCT time_period STRING, number_estimate INT64, estimation_method STRING, -- manuscript_copies/citations/library_records confidence STRING >>, -- التوزيع الديموغرافي demographic_distribution STRUCT by_social_class ARRAY<STRUCT class STRING, percentage_estimate FLOAT64 >>, by_profession ARRAY<STRUCT profession STRING, percentage_estimate FLOAT64 >>, by_geographical_region ARRAY<STRUCT region STRING, penetration STRING -- widespread/common/rare >> >>, -- القراء البارزون notable_readers ARRAY<STRUCT reader_id STRING, -- FK → author_profiles_master reader_name STRING, reading_date DATE, -- كيف عرفنا؟ evidence STRING, -- quotation/commentary/library_record/ijaza -- التأثير على القارئ impact_on_reader STRUCT impact_type STRING, -- transformative/significant/moderate/minimal impact_description STRING, -- نتائج القراءة reader_actions ARRAY<STRING> -- wrote_commentary/adopted_position/refuted >> >> >, -- أنماط القراءة reading_patterns STRUCT -- السياقات reading_contexts ARRAY<STRING>, -- classroom/private_study/public_lecture/halqa -- الطرق reading_methods ARRAY<STRING>, -- memorization/commentary/extraction/comparison -- الاستخدامات uses ARRAY<STRUCT use_type STRING, -- teaching/debate/reference/devotion/entertainment frequency STRING >> >, -- الاستقبال والتأويل reception_and_interpretation STRUCT -- الفهم السائد dominant_interpretation STRUCT interpretation_summary STRING, -- هل يطابق نية المؤلف؟ matches_author_intent BOOLEAN, divergence_description STRING >>, -- التأويلات المتنافسة competing_interpretations ARRAY<STRUCT interpretation_version STRING, interpreting_group STRING, -- الآثار consequences ARRAY<STRING> >>, -- سوء الفهم الشائع common_misreadings ARRAY<STRUCT misreading_description STRING, how_widespread STRING, -- لماذا حدث؟ reasons ARRAY<STRING> >> >, -- التداول والانتشار circulation STRUCT -- النسخ المخطوطة manuscript_circulation STRUCT number_of_extant_copies INT64, geographical_distribution ARRAY<STRING>, -- الجودة quality_variation STRING, -- consistent/variable/highly_variable -- الشروح والحواشي marginalia_frequency STRING -- abundant/common/rare/none >>, -- الترجمات translations ARRAY<STRUCT target_language STRING, translation_date DATE, translator_id STRING, -- الانتشار translation_impact STRING >>, -- الطباعة (إن كان مطبوعاً) print_history STRUCT first_print_date DATE, number_of_editions INT64, modern_readership_estimate STRING >> >, -- التأثير طويل المدى long_term_impact STRUCT -- الأجيال اللاحقة generational_transmission ARRAY<STRUCT generation_period STRING, readership_level STRING, -- increasing/stable/declining/forgotten reasons ARRAY<STRING> >>, -- الإحياء revivals ARRAY<STRUCT revival_date DATE, revival_context STRING, reviver STRING, new_relevance STRING >> >, -- المقارنة comparative_readership STRUCT -- مقارنة مع نصوص أخرى comparison_texts ARRAY<STRUCT compared_text_id STRING, relative_popularity STRING, -- more_popular/similar/less_popular reasons_for_difference STRING >> >, related_entities STRUCT related_texts ARRAY<STRING>, related_scholars ARRAY<STRING>, related_institutions ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)PARTITION BY period_century_hijriCLUSTER BY text_id, actual_readership.estimated_readers.number_estimate DESC;


-- ════════════════════════════════════════════════════════════════════
-- [074] relationship_graph
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.relationship_graph (
  relationship_id STRING NOT NULL,
  
  -- الكيانات
  entity_1 STRUCT
    entity_type STRING,                  -- scholar/text/event/concept/institution/location
    entity_id STRING,
    entity_name STRING,
    
    -- الجدول المصدر
    source_table STRING
  >,
  
  entity_2 STRUCT
    entity_type STRING,
    entity_id STRING,
    entity_name STRING,
    source_table STRING
  >,
  
  -- نوع العلاقة (🔥 الأهم!)
  relationship_type STRING,              -- wrote/taught/influenced/funded/censored/translated/attended/opposed
  
  -- التفاصيل
  relationship_details STRUCT
    -- القوة
    strength FLOAT64,                    -- 0-100
    
    -- الاتجاه
    directionality STRING,               -- unidirectional/bidirectional
    
    -- المدة
    duration STRUCT
      start_date DATE,
      end_date DATE,
      is_ongoing BOOLEAN
    >>,
    
    -- السياق
    context STRING,
    
    -- الأدلة
    evidence ARRAY<STRUCT
      evidence_type STRING,
      evidence_source STRING,
      confidence FLOAT64
    >>
  >,
  
  -- الخصائص الإضافية (للاستعلامات)
  properties JSON,                       -- مرونة كاملة
  
  -- للتحليل الشبكي
  graph_metrics STRUCT
    centrality FLOAT64,
    betweenness FLOAT64,
    clustering_coefficient FLOAT64
  >,
  
  metadata STRUCT
    created_at TIMESTAMP,
    confidence_score FLOAT64,
    curator_notes STRING
  >
)
CLUSTER BY entity_1.entity_type, relationship_type, entity_2.entity_type;


-- ════════════════════════════════════════════════════════════════════
-- [075] relationship_graph_nodes
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.relationship_graph_nodes`
(
    relation_id STRING,
    
    -- الطرف الأول
    entity_1_id STRING,
    entity_1_type STRING, -- Scholar, Book, Concept
    
    -- الطرف الثاني
    entity_2_id STRING,
    entity_2_type STRING,
    
    -- العلاقة (أهم حقل)
    relationship_type STRING, -- Teacher_of, Criticized, Influenced_by, Financed
    connection_strength FLOAT64, -- 0.0 to 1.0 (قوة العلاقة)
    
    -- الأدلة
    evidence_source STRUCT<
        source_text_id STRING,
        page_number INT64,
        snippet STRING
    >,
    
    -- التحليل الزمني للعلاقة
    start_date DATE,
    end_date DATE
)
CLUSTER BY relationship_type, entity_1_type;


-- ════════════════════════════════════════════════════════════════════
-- [076] reports
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.smart_notebook.reports (
report_id STRING NOT NULL,
user_id STRING NOT NULL,
report_type STRING, -- "daily", "weekly", "monthly"
period_start DATE,
period_end DATE,
content STRUCT
total_notes INT64,
notes_by_project ARRAY<STRUCT<project STRING, count INT64>>,
top_tags ARRAY<STRING>,
key_ideas ARRAY<STRING>,
pending_tasks INT64,
insights STRING -- تحليل ذكي
>,
delivered_at TIMESTAMP,
delivery_channel STRING -- "whatsapp", "email"
);


-- ════════════════════════════════════════════════════════════════════
-- [077] ruler_profiles_and_policies
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.ruler_profiles_and_policies` (
    ruler_id STRING, 
    ruler_name STRING, 
    reign_start INT64, 
    associated_scholar_id STRING, -- للربط بالعلماء
    positions_held STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [078] scientific_and_philosophical_heritage
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.scientific_and_philosophical_heritage` (
    work_id STRING, discipline STRING, scientific_contribution STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [079] scientific_practices_and_methods
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.scientific_practices_and_methods ( practice_record_id STRING NOT NULL, -- السياق period STRING, location STRING, -- المجال scientific_domain STRING, -- medicine/astronomy/alchemy/optics/mathematics -- الممارس practitioner STRUCT practitioner_id STRING, -- FK → author_profiles_master role STRING, -- researcher/teacher/physician/astronomer/engineer -- التدريب training STRUCT formal_training ARRAY<STRING>, apprenticeship_details STRING, self_taught_aspects ARRAY<STRING> >> >, -- المكان المادي physical_space STRUCT -- نوع المكان space_type STRING, -- laboratory/observatory/library/hospital/workshop/field -- الوصف space_description STRUCT size STRING, layout STRING, equipment_inventory ARRAY<STRUCT equipment_name STRING, equipment_function STRING, equipment_origin STRING, -- local_made/imported/improvised cost_estimate FLOAT64 >>, -- الشروط البيئية environmental_conditions STRUCT lighting STRING, ventilation STRING, safety_measures ARRAY<STRING> >> >>, -- الوصول access STRUCT access_level STRING, -- public/restricted/private who_had_access ARRAY<STRING> >> >, -- المنهجية اليومية daily_methodology STRUCT -- الروتين daily_routine STRUCT work_hours STRING, typical_activities ARRAY<STRUCT activity STRING, time_allocation STRING >> >>, -- الإجراءات procedures ARRAY<STRUCT procedure_name STRING, procedure_type STRING, -- observation/experiment/calculation/dissection/distillation -- الخطوات steps ARRAY<STRUCT step_number INT64, step_description STRING, duration STRING, critical_success_factors ARRAY<STRING> >>, -- الأدوات المستخدمة tools_used ARRAY<STRING>, -- معدل النجاح success_rate STRUCT rate_estimate FLOAT64, factors_affecting_success ARRAY<STRING> >> >> >, -- التوثيق والسجلات documentation_practices STRUCT -- كيف يُوثق؟ recording_methods ARRAY<STRING>, -- written_notes/diagrams/sketches/numerical_tables -- دفاتر الملاحظات notebooks STRUCT notebook_existence BOOLEAN, notebook_organization STRING, -- ما يُسجل recorded_elements ARRAY<STRING>, -- observations/measurements/failures/hypotheses/personal_reflections -- دقة التسجيل recording_precision STRING, -- الحفاظ preservation_status STRING >>, -- التقارير reporting STRUCT reporting_format STRING, reporting_frequency STRING, audience STRING, -- ما يُحذف من التقارير؟ omitted_information ARRAY<STRING> -- failures/uncertainties/personal_opinions >> >, -- التعامل مع البيانات data_handling STRUCT -- جمع البيانات data_collection STRUCT collection_methods ARRAY<STRING>, sampling_strategy STRING, sample_size_typical INT64, -- الأخطاء الممكنة potential_errors ARRAY<STRING> >>, -- تحليل البيانات data_analysis STRUCT analysis_techniques ARRAY<STRING>, mathematical_tools_used ARRAY<STRING>, -- التفسير interpretation_framework STRING >>, -- التحقق verification STRUCT verification_methods ARRAY<STRING>, replication_practice STRING, -- من يُحقق؟ verifiers ARRAY<STRING> >> >, -- التعامل مع الفشل failure_handling STRUCT -- كيف يُعامل الفشل؟ failure_attitude STRING, -- learning_opportunity/embarrassment/suppressed -- التوثيق failure_documentation STRING, -- detailed/selective/none -- أمثلة موثقة documented_failures ARRAY<STRUCT failure_description STRING, failure_analysis STRING, lessons_learned STRING >> >, -- التعاون collaboration_practices STRUCT -- هل يعمل منفرداً أم مع فريق؟ work_mode STRING, -- solitary/collaborative/mixed -- إن كان تعاونياً collaboration_details STRUCT team_size INT64, team_composition ARRAY<STRING>, division_of_labor STRING, -- التواصل communication_methods ARRAY<STRING>, conflict_resolution STRING >>, -- مشاركة المعرفة knowledge_sharing STRUCT sharing_willingness STRING, -- open/selective/secretive reasons_for_secrecy ARRAY<STRING>, -- البراءات/الامتيازات proprietary_knowledge BOOLEAN >> >, -- المعايير الأخلاقية ethical_standards STRUCT -- القواعد المُتبعة ethical_rules ARRAY<STRING>, -- التعامل مع الكائنات الحية animal_human_subjects STRUCT use_of_animals BOOLEAN, use_of_humans BOOLEAN, -- الموافقة consent_practices STRING, -- الاهتمام بالرفاهية welfare_considerations STRING >>, -- الانتهاكات ethical_violations ARRAY<STRUCT violation_description STRING, consequences STRING >> >, -- التطور والابتكار evolution_innovation STRUCT -- كيف تطورت الممارسة؟ changes_over_time ARRAY<STRUCT change_date DATE, what_changed STRING, driver_of_change STRING, -- new_tool/new_theory/critique/accident impact STRING >>, -- الابتكارات المنهجية methodological_innovations ARRAY<STRUCT innovation_description STRING, innovator STRING, adoption_rate STRING >> >, -- المقارنة عبر المجالات cross_field_comparison STRUCT practices_in_other_fields ARRAY<STRUCT field STRING, similarity_level STRING, -- التعلم المتبادل mutual_influence BOOLEAN >> >, related_entities STRUCT related_scholars ARRAY<STRING>, related_texts ARRAY<STRING>, related_institutions ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)CLUSTER BY scientific_domain, period;


-- ════════════════════════════════════════════════════════════════════
-- [080] semantic_shifts_and_terminology
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.semantic_shifts_and_terminology` (
    term_id STRING, term STRING, era STRING, meaning_vector ARRAY<FLOAT64>
);


-- ════════════════════════════════════════════════════════════════════
-- [081] smart_exploration_buffer
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.smart_exploration_buffer`
(
    buffer_id STRING DEFAULT GENERATE_UUID(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    
    -- المصدر
    source_reference STRUCT<
        table_name STRING,
        record_id STRING,
        chunk_text STRING OPTIONS(description="النص الأصلي الذي تم تحليله")
    >,

    -- نوع العملية الذكية
    ai_task_type STRING OPTIONS(description="Sentiment Analysis, Entity Extraction, Pattern Recognition, Bias Check"),
    model_version STRING OPTIONS(description="Gemini 1.5 Pro, Flash, etc."),

    -- المخرجات (مرنة جداً)
    analysis_result_json JSON OPTIONS(description="تخزين النتيجة كاملة بصيغة JSON للمرونة"),
    extracted_concepts ARRAY<STRING>,
    
    -- الذاكرة المتجهة (للبحث الدلالي)
    embedding_vector ARRAY<FLOAT64> OPTIONS(description="768 or 1536 dimensions vector"),
    
    -- ملاحظات النظام
    system_notes STRING
)
PARTITION BY DATE(timestamp)
CLUSTER BY ai_task_type;


-- ════════════════════════════════════════════════════════════════════
-- [082] social_history_and_daily_life
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.social_history_and_daily_life`
(
    record_id STRING,
    
    -- الزمن والمكان (مفاتيح التقسيم)
    reference_year INT64 NOT NULL,
    region_name STRING,
    
    -- الاقتصاد المعيشي (الأسعار والأجور)
    living_standards STRUCT<
        staple_food_price FLOAT64 OPTIONS(description="سعر صاع القمح أو الخبز بالدينار/الدرهم"),
        daily_wage_unskilled FLOAT64 OPTIONS(description="أجرة العامل البسيط يومياً"),
        currency_used STRING,
        purchasing_power_notes STRING OPTIONS(description="ملاحظات حول الغلاء والرخص")
    >,

    -- الصحة والأوبئة
    health_and_demographics STRUCT<
        major_epidemics ARRAY<STRING> OPTIONS(description="الطاعون الأسود، الجارف، إلخ"),
        estimated_mortality_rate STRING,
        famines_recorded BOOL,
        public_health_notes STRING
    >,

    -- الثقافة المادية (الأكل واللبس)
    material_culture STRUCT<
        common_cuisine ARRAY<STRING> OPTIONS(description="الأطعمة الشائعة"),
        clothing_style_elite STRING,
        clothing_style_commoners STRING,
        sumptuary_laws STRING OPTIONS(description="قوانين تمنع فئات معينة من لبس معين - الغيار")
    >,

    -- الاحتفالات والمجتمع
    social_events STRUCT<
        major_festivals ARRAY<STRING>,
        social_unrest_events ARRAY<STRING> OPTIONS(description="فتن عامة، ثورات جياع"),
        status_of_dhimmis STRING OPTIONS(description="ملاحظات حول وضع أهل الذمة في تلك السنة")
    >
)
PARTITION BY RANGE_BUCKET(reference_year, GENERATE_ARRAY(0, 1500, 50))
CLUSTER BY region_name;


-- ════════════════════════════════════════════════════════════════════
-- [083] standards_of_proof_evolution
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.standards_of_proof_evolution ( standard_id STRING NOT NULL, -- الإطار الزمني period_start DATE, period_end DATE, period_century_hijri STRING, -- المجال المعرفي epistemic_domain STRING, -- theology/law/medicine/astronomy/philosophy -- نوع الدليل proof_type STRING, -- textual/rational/empirical/consensual/intuitive -- المعيار standard_description STRUCT standard_name STRING, standard_definition STRING, -- متى يُعتبر شيء "مُثبتاً"؟ acceptance_criteria ARRAY<STRUCT criterion STRING, threshold STRING, -- absolute/probable/possible justification STRING >>, -- التسلسل الهرمي للأدلة hierarchy_of_evidence ARRAY<STRUCT rank INT64, evidence_type STRING, authority_level STRING -- definitive/strong/weak/inadmissible >> >, -- التطبيق العملي practical_application STRUCT -- أمثلة من النصوص exemplary_cases ARRAY<STRUCT text_id STRING, case_description STRING, how_standard_applied STRING >>, -- الاستثناءات exceptions ARRAY<STRUCT exception_description STRING, when_allowed STRING >> >, -- التحولات transformations STRUCT -- التغيرات في المعيار changes ARRAY<STRUCT change_date DATE, previous_standard STRING, new_standard STRING, -- ما الذي تغير؟ what_changed STRING, -- threshold/hierarchy/scope/method -- لماذا؟ drivers_of_change ARRAY<STRUCT driver_type STRING, -- intellectual/political/social/technological driver_description STRING, -- الفاعلون key_actors ARRAY<STRING> >> >> >, -- التباينات المذهبية sectarian_variations STRUCT has_variations BOOLEAN, variations ARRAY<STRUCT madhhab_or_school STRING, their_standard STRING, divergence_from_mainstream STRING, rationale STRING >> >, -- المقارنة عبر-حضارية comparative_perspective STRUCT contemporaneous_standards ARRAY<STRUCT civilization STRING, their_standard STRING, -- أيهما أكثر صرامة؟ relative_stringency STRING, -- more_stringent/similar/less_stringent mutual_influence STRING -- did they influence each other? >> >, -- الآثار المعرفية epistemic_consequences STRUCT -- ماذا سُمح بسبب هذا المعيار؟ enabled_claims ARRAY<STRING>, -- ماذا مُنع؟ excluded_claims ARRAY<STRING>, -- كيف شكّل البحث؟ research_shaping STRING >, -- الجدالات حول المعيار نفسه meta_debates STRUCT debates_about_standard ARRAY<STRUCT debate_topic STRING, debaters ARRAY<STRING>, positions ARRAY<STRUCT position STRING, proponent STRING >>, outcome STRING >> >, related_entities STRUCT related_texts ARRAY<STRING>, related_debates ARRAY<STRING>, related_methodologies ARRAY<STRING> >, metadata STRUCT created_at TIMESTAMP, curator_notes STRING >)PARTITION BY period_startCLUSTER BY epistemic_domain, period_century_hijri;


-- ════════════════════════════════════════════════════════════════════
-- [084] state_structure_and_policy
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.state_structure_and_policy` (
    structure_id STRING, era_id STRING, department_name STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [085] stochastic_event_generator
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.stochastic_event_generator ( event_class_id STRING NOT NULL, -- Event Class event_class STRUCT event_type STRING, -- invasion/plague/discovery/genius_birth/natural_disaster event_category STRING, -- exogenous_shock/endogenous_crisis description STRING >, -- Probability Distribution probability_distribution STRUCT distribution_type STRING, -- Poisson/Exponential/Power_Law/Bernoulli -- Parameters parameters ARRAY<STRUCT parameter_name STRING, -- lambda/mean/alpha parameter_value FLOAT64 >>, -- Base Rate (per year) base_rate_per_year FLOAT64, -- Conditional Probabilities conditional_on ARRAY<STRUCT condition STRING, probability_multiplier FLOAT64 -- how much does this condition change probability? >> >, -- Impact Profile impact_profile STRUCT -- Affected Variables affected_variables ARRAY<STRUCT variable_name STRING, impact_type STRING, -- shock/gradual/persistent -- Magnitude Distribution magnitude_distribution STRING, -- Normal(μ,σ)/Lognormal/Uniform mean_impact FLOAT64, std_impact FLOAT64 >>, -- Spatial Scope spatial_scope STRING, -- local/regional/empire_wide/global -- Temporal Profile temporal_profile STRUCT immediate_impact FLOAT64, recovery_time_years INT64, recovery_function STRING -- exponential/linear/none >> >, -- Historical Occurrences historical_instances ARRAY<STRUCT date DATE, event_id STRING, -- FK → comprehensive_timeline_events magnitude FLOAT64, impact_assessment STRING >>, -- Simulation Protocol simulation_protocol STRUCT sampling_method STRING, -- Monte_Carlo/Latin_Hypercube -- For Monte Carlo sample_size INT64, -- how many random draws per simulation? -- Correlation with other events correlated_with ARRAY<STRUCT other_event_class_id STRING, correlation_coefficient FLOAT64 >> >, metadata STRUCT calibrated_from STRING, confidence_level STRING >)CLUSTER BY event_class.event_type;


-- ════════════════════════════════════════════════════════════════════
-- [086] sufi_orders_and_practices
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.sufi_orders_and_practices` (
    order_id STRING, order_name STRING, practices ARRAY<STRING>
);


-- ════════════════════════════════════════════════════════════════════
-- [087] system_audit_logs
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.system_audit_logs` (
    log_id STRING, timestamp TIMESTAMP, action_type STRING, details STRING
) PARTITION BY DATE(timestamp);


-- ════════════════════════════════════════════════════════════════════
-- [088] system_dynamics_equations
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.system_dynamics_equations ( equation_id STRING NOT NULL, -- Target Variable (what we're modeling) target_variable STRUCT variable_name STRING, -- intellectual_output/religious_tolerance/state_capacity variable_type STRING, -- stock/flow/auxiliary domain STRING, -- economy/politics/knowledge/society units STRING, -- texts_per_year/scholars_count/tolerance_index -- Historical Range historical_range STRUCT min_value FLOAT64, max_value FLOAT64, typical_value FLOAT64 >> >, -- The Equation (🔥 THE CORE!) equation STRUCT equation_type STRING, -- differential/difference/algebraic/stochastic -- Mathematical Expression expression STRING, -- "dS/dt = α*W - β*P - γ*S" -- S=scholarly_output, W=waqf, P=persecution, α,β,γ=parameters -- In plain text interpretation STRING, -- "Scholarly output increases with waqf funding..." -- Parameters parameters ARRAY<STRUCT parameter_name STRING, -- α, β, γ parameter_value FLOAT64, confidence_interval STRING, -- Calibration calibrated_from ARRAY<STRING> -- which historical periods? >>, -- Independent Variables (inputs) independent_variables ARRAY<STRUCT variable_name STRING, source_table STRING, -- where to get this data source_field STRING, -- Lag (if time-delayed effect) lag_years INT64, transformation STRING -- log/square/identity >>, -- Nonlinearities nonlinear_terms ARRAY<STRUCT term_expression STRING, -- "W*P" (interaction), "S^2" (saturation) interpretation STRING >> >, -- Feedback Loops (🔥 CRITICAL!) feedback_loops STRUCT positive_loops ARRAY<STRUCT loop_description STRING, -- "Success → Fame → Funding → More Success" variables_involved ARRAY<STRING>, amplification_factor FLOAT64, -- Stability stability STRING -- stable/unstable/conditionally_stable >>, negative_loops ARRAY<STRUCT loop_description STRING, -- "Persecution → Brain Drain → Less Output → More Persecution" variables_involved ARRAY<STRING>, dampening_factor FLOAT64, equilibrium_point FLOAT64 >> >, -- Tipping Points tipping_points ARRAY<STRUCT threshold_variable STRING, threshold_value FLOAT64, -- What happens at tipping point? regime_before STRING, regime_after STRING, -- Reversibility is_reversible BOOLEAN, -- Historical Examples historical_instances ARRAY<STRING> -- FK → comprehensive_timeline_events >>, -- Validation validation STRUCT fitted_periods ARRAY<STRING>, -- "750-850 AH", "1200-1300 AH" -- Accuracy Metrics metrics STRUCT r_squared FLOAT64, rmse FLOAT64, mae FLOAT64, -- Out-of-sample prediction prediction_accuracy_future FLOAT64 -- tested on periods NOT used for calibration >>, -- Sensitivity Analysis sensitivity ARRAY<STRUCT parameter_name STRING, sensitivity_coefficient FLOAT64, -- how much does output change if this changes 1%? critical BOOLEAN -- is this a critical parameter? >> >, metadata STRUCT equation_source STRING, -- "derived from regression", "theoretical model" confidence_level STRING, limitations ARRAY<STRING> >)CLUSTER BY target_variable.domain, target_variable.variable_name;


-- ════════════════════════════════════════════════════════════════════
-- [089] tasks
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.`iqraa-12.smart_notebook.tasks` (
    task_id STRING NOT NULL,
    user_id STRING NOT NULL,
    source_note_id STRING NOT NULL,             -- الملاحظة المصدر
    
    -- المحتوى
    title STRING NOT NULL,
    description STRING,
    
    -- التصنيف
    project STRING,
    tags ARRAY<STRING>,
    priority STRING,                            -- "urgent", "high", "medium", "low"
    
    -- التوقيت
    created_at TIMESTAMP NOT NULL,
    due_date DATE,
    completed_at TIMESTAMP,
    
    -- الحالة
    status STRING,                              -- "pending", "in_progress", "done", "cancelled", "deferred"
    
    -- التذكير
    reminder_at TIMESTAMP,
    reminder_sent BOOL,
    
    -- الربط
    related_tasks ARRAY<STRING>,
    blocked_by ARRAY<STRING>,
    
    -- البيانات الوصفية
    estimated_hours FLOAT64,
    actual_hours FLOAT64,
    notes STRING
)
PARTITION BY DATE(created_at)
CLUSTER BY user_id, status, project;


-- ════════════════════════════════════════════════════════════════════
-- [090] text_segments_micro_index
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.text_segments_micro_index`
(
    segment_id STRING,
    source_book_id STRING,
    author_id STRING,
    century_hijri_main STRING, -- Cluster Key
    
    -- المحتوى
    raw_text_chunk STRING,
    page_number INT64,
    
    -- الذكاء (Embeddings)
    embedding_vector ARRAY<FLOAT64>, -- للبحث الدلالي
    
    -- المفاهيم المرتبطة
    linked_concepts_ids ARRAY<STRING>
)
PARTITION BY RANGE_BUCKET(CAST(century_hijri_main AS INT64), GENERATE_ARRAY(0, 15, 1))
CLUSTER BY source_book_id;


-- ════════════════════════════════════════════════════════════════════
-- [091] textual_genres_and_rhetorical_strategies
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.textual_genres_and_rhetorical_strategies` (
    genre_id STRING, genre_name STRING, rhetoric_style STRING
);


-- ════════════════════════════════════════════════════════════════════
-- [092] time_perception_and_calendars
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.time_perception_and_calendars (
  calendar_record_id STRING NOT NULL,
  
  -- النظام التقويمي
  calendar_system STRING,               -- Hijri/Gregorian/Julian/Persian/Coptic/Seleucid
  
  -- الاستخدام
  usage_context STRUCT<
    primary_users ARRAY<STRING>,        -- administration/farmers/clergy/astronomers
    purpose STRING,                     -- tax_collection/religious_rituals/agriculture
    geographical_spread ARRAY<STRING>
  >,
  
  -- الأحداث الزمنية
  key_dates STRUCT<
    new_year_date DATE,
    major_festivals ARRAY<STRUCT<
      festival_name STRING,
      date_in_calendar STRING,
      significance STRING
    >>
  >,
  
  -- إدراك الزمن
  temporal_concepts STRUCT<
    era_concept STRING,                 -- cyclical/linear/apocalyptic
    day_division STRING                 -- prayer_times/hours/watches
  >,
  
  -- التحويل والمزامنة
  synchronization STRUCT<
    correspondence_with_hijri STRING,
    conversion_issues ARRAY<STRING>
  >
)
CLUSTER BY calendar_system;


-- ════════════════════════════════════════════════════════════════════
-- [093] tools_technologies_and_material_culture
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.tools_technologies_and_material_culture ( tool_record_id STRING NOT NULL, -- الأداة/التقنية tool_info STRUCT tool_name STRING, tool_type STRING, -- instrument/material/technique/infrastructure -- الوصف description STRING, function STRING, -- المجال domain STRING -- astronomy/medicine/chemistry/mathematics/writing/navigation >, -- الظهور emergence STRUCT -- متى ظهرت؟ emergence_date DATE, emergence_location STRING, -- الأصل origin STRUCT origin_type STRING, -- indigenous_invention/imported/adapted -- إن كانت مستوردة source_civilization STRING, transmission_route STRING, -- المخترع/المُدخل inventor_introducer STRING >>, -- السياق emergence_context STRUCT need STRING, -- ما الحاجة التي لبّتها؟ enabling_factors ARRAY<STRING>, obstacles ARRAY<STRING> >> >, -- المواصفات التقنية specifications STRUCT -- المواد materials ARRAY<STRING>, -- الأبعاد dimensions STRING, -- التعقيد complexity STRING, -- simple/moderate/complex/very_complex -- الدقة precision STRING, -- المتانة durability STRING, -- سهولة الاستخدام user_friendliness STRING >, -- التصنيع manufacturing STRUCT -- كيف يُصنع؟ manufacturing_process STRING, -- الحرفيون craftsmen STRUCT craftsmen_type STRING, skill_level_required STRING, training_duration STRING >>, -- التكلفة production_cost STRUCT cost_estimate FLOAT64, cost_category STRING, -- cheap/affordable/expensive/luxury -- المقارنة cost_relative_to_wages STRING >>, -- التوفر availability STRING -- widely_available/limited/rare >, -- الاستخدام usage STRUCT -- من يستخدمه؟ users STRUCT user_types ARRAY<STRING>, -- scholars/physicians/astronomers/students/artisans user_level_required STRING, -- beginner/intermediate/expert -- التدريب training_required STRUCT duration STRING, training_method STRING, success_rate STRING >> >>, -- التطبيقات applications ARRAY<STRUCT application STRING, application_frequency STRING, application_importance STRING >>, -- القيود limitations ARRAY<STRING>, -- الأخطاء الشائعة common_errors ARRAY<STRING> >, -- التطور evolution STRUCT -- التحسينات improvements ARRAY<STRUCT improvement_date DATE, improvement_description STRING, innovator STRING, -- الأثر impact STRING >>, -- المشتقات derivatives ARRAY<STRUCT derivative_tool STRING, relationship STRING >>, -- الاندماج integration_with_other_tools ARRAY<STRUCT other_tool STRING, integration_type STRING >> >, -- التأثير المعرفي (🔥 الأهم!) epistemic_impact STRUCT -- على الممارسة العلمية impact_on_practice STRUCT what_became_possible ARRAY<STRING>, what_became_obsolete ARRAY<STRING>, -- التحولات المنهجية methodological_shifts ARRAY<STRING>, -- الدقة precision_enhancement STRING >>, -- على المفاهيم impact_on_concepts STRUCT new_concepts_enabled ARRAY<STRING>, conceptual_refinements ARRAY<STRING> >>, -- على الإنتاج impact_on_productivity STRUCT productivity_change STRING, -- multiplied/increased/unchanged/decreased quantification STRING, -- الأمثلة examples ARRAY<STRING> >>, -- على التعليم impact_on_education STRUCT pedagogical_changes ARRAY<STRING>, curriculum_changes ARRAY<STRING>, -- الوصول access_democratization BOOLEAN >>, -- الأعمال الممكنة enabled_works ARRAY<STRUCT work_id STRING, work_title STRING, dependence_level STRING -- essential/helpful/marginal >> >, -- التبني والانتشار diffusion STRUCT -- معدل التبني adoption_rate STRUCT initial_adoption STRING, -- rapid/gradual/slow/resisted -- العوامل facilitating_factors ARRAY<STRING>, hindering_factors ARRAY<STRING> >>, -- الانتشار الجغرافي geographical_spread ARRAY<STRUCT region STRING, arrival_date DATE, penetration_level STRING >>, -- الانتشار الاجتماعي social_diffusion STRUCT initial_users STRING, -- elite/specialized/general spread_pattern STRING, -- top_down/bottom_up/lateral -- الحواجز barriers_to_access ARRAY<STRING> >> >, -- الاندثار أو الاستمرار fate STRUCT current_status STRING, -- still_used/obsolete/transformed/forgotten -- إن اندثرت obsolescence STRUCT obsolescence_date DATE, reasons ARRAY<STRING>, -- البديل replaced_by STRING >>, -- الإرث legacy STRUCT modern_equivalents ARRAY<STRING>, lasting_impact STRING >> >, -- المقارنة comparative_analysis STRUCT -- مع أدوات أخرى comparison_tools ARRAY<STRUCT tool_name STRING, comparative_advantage STRING >>, -- مع حضارات أخرى cross_civilizational ARRAY<STRUCT civilization STRING, their_equivalent STRING, comparison STRING >> >, related_entities STRUCT related_scholars ARRAY<STRING>, related_texts ARRAY<STRING>, related_institutions ARRAY<STRING>, related_discoveries ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, extant_examples INT64, -- عدد الأمثلة الباقية museum_locations ARRAY<STRING>, confidence_level STRING >)CLUSTER BY tool_info.domain, emergence.emergence_date;


-- ════════════════════════════════════════════════════════════════════
-- [094] trade_routes_and_knowledge_transmission
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.trade_routes_and_knowledge_transmission` (
    route_id STRING, route_name STRING, goods_traded ARRAY<STRING>
);


-- ════════════════════════════════════════════════════════════════════
-- [095] translation_movements_and_choices
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.translation_movements_and_choices ( translation_record_id STRING NOT NULL, -- التوقيت translation_date DATE, translation_century_hijri STRING, -- الموجة الترجمية translation_wave STRUCT wave_name STRING, -- Umayyad_early/Abbasid_golden/Post_Mongol wave_period STRING, wave_intensity STRING, -- peak/active/declining/dormant -- الراعي patron STRUCT patron_id STRING, patron_motivation STRING, funding_level STRING >> >, -- العمل المُترجَم translated_work STRUCT original_title STRING, original_language STRING, original_author STRING, original_composition_date STRING, -- التصنيف subject_area STRING, work_type STRING, -- الأهمية في الثقافة الأصلية importance_in_source_culture STRING >, -- المترجم translator STRUCT translator_id STRING, -- FK → author_profiles_master translator_background STRUCT native_language STRING, religious_affiliation STRING, scholarly_training ARRAY<STRING>, -- الشبكات patron_connections ARRAY<STRING>, institutional_affiliation STRING >>, -- الكفاءة linguistic_competence STRUCT source_language_level STRING, target_language_level STRING, subject_matter_expertise STRING >>, -- الأجر compensation STRUCT payment_type STRING, amount FLOAT64, additional_benefits STRING >> >, -- عملية الترجمة translation_process STRUCT translation_method STRING, -- direct/intermediate_language/collaborative -- إن كان collaborative collaboration_details STRUCT number_of_translators INT64, division_of_labor STRING, quality_control STRUCT reviewer_id STRING, revision_rounds INT64 >> >>, -- التحديات challenges_encountered ARRAY<STRUCT challenge_type STRING, -- linguistic/conceptual/technical/ideological challenge_description STRING, resolution STRING >>, -- المدة time_taken_months INT64 >, -- الاختيارات الترجمية (🔥 حاسم!) translation_choices STRUCT -- معايير الاختيار selection_criteria STRUCT stated_criteria ARRAY<STRING>, implicit_criteria ARRAY<STRING>, -- ما لم يُصرح به -- من قرر؟ decision_maker STRING, decision_process STRING >>, -- الحذف والإضافة modifications STRUCT deletions ARRAY<STRUCT deleted_section STRING, deletion_reason STRING, -- heretical/irrelevant/dangerous/unclear ideological_motivation BOOLEAN >>, additions ARRAY<STRUCT added_section STRING, addition_reason STRING, added_by STRING >>, alterations ARRAY<STRUCT altered_passage STRING, original_meaning STRING, altered_meaning STRING, alteration_reason STRING >> >>, -- التكييف المفاهيمي conceptual_adaptation STRUCT adapted_concepts ARRAY<STRUCT original_concept STRING, target_equivalent STRING, fit_quality STRING, -- perfect/adequate/forced/misleading -- الفقدان semantic_loss STRING, semantic_gain STRING -- أحياناً الترجمة تُثري! >> >>, -- المصطلحات المُبتكرة neologisms ARRAY<STRUCT new_term_arabic STRING, original_term STRING, coinage_rationale STRING, -- الانتشار adoption_level STRING -- widespread/limited/rejected/replaced >> >, -- النص المُترجَم translated_text STRUCT arabic_title STRING, text_id STRING, -- FK → texts_full_corpus -- الجودة translation_quality STRUCT accuracy STRING, readability STRING, faithfulness_vs_freedom STRING, -- التقييمات contemporary_assessment STRING, modern_assessment STRING >> >, -- الاستقبال reception STRUCT immediate_reception STRUCT readership_level STRING, critical_response STRING, -- هل أثار جدلاً؟ controversy STRUCT was_controversial BOOLEAN, controversy_type STRING, opponents ARRAY<STRING>, defenders ARRAY<STRING> >> >>, -- التأثير impact STRUCT impact_on_discipline STRING, derivative_works ARRAY<STRING>, -- شروح/ردود/تلخيصات -- التبني المؤسسي institutional_adoption ARRAY<STRING> >>, -- المصير fate STRUCT long_term_status STRING, -- canonical/marginal/forgotten/replaced retranslations ARRAY<STRUCT retranslation_date DATE, retranslator_id STRING, retranslation_reason STRING >> >> >, -- ما لم يُترجَم (🔥 الأهم!) non_translations STRUCT -- الأعمال الأخرى لنفس المؤلف other_works_by_author ARRAY<STRUCT work_title STRING, why_not_translated STRING, -- هل كان معروفاً؟ was_known_about BOOLEAN, -- التكلفة المعرفية cost_of_omission STRING >>, -- الأعمال البديلة المُترجمة competing_works_translated ARRAY<STRUCT work_title STRING, preference_reason STRING >> >, -- المقارنة عبر الموجات comparative_analysis STRUCT -- كيف تختلف هذه الترجمة عن موجات أخرى؟ wave_comparison STRING, -- التحولات في الأولويات priority_shifts ARRAY<STRING> >, related_entities STRUCT related_texts ARRAY<STRING>, related_scholars ARRAY<STRING>, related_institutions ARRAY<STRING>, related_patrons ARRAY<STRING> >, metadata STRUCT data_sources ARRAY<STRING>, confidence_level STRING, curator_notes STRING >)PARTITION BY translation_dateCLUSTER BY translation_wave.wave_name, translated_work.subject_area;


-- ════════════════════════════════════════════════════════════════════
-- [096] turkic_altaic_infiltration
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.turkic_altaic_infiltration`
(
  -- ═══════════════════════════════════════════════════════════════════
  -- 🔑 المفتاح الأساسي
  -- ═══════════════════════════════════════════════════════════════════
  infiltration_id STRING NOT NULL,
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 📊 حقول التصنيف الأساسية
  -- ═══════════════════════════════════════════════════════════════════
  infiltration_type STRING NOT NULL,        -- "Political", "Religious", "Cultural", "Legal", "Military"
  infiltration_subtype STRING,              -- "Institutional", "Doctrinal", "Practice", "Law_Code", "System"
  
  turkic_origin STRING NOT NULL,            -- "Central_Asian_Turks", "Seljuk", "Mamluk", "Ottoman", "Mongol_Turkified"
  
  danger_level STRING NOT NULL,             -- "Critical", "High", "Medium", "Low"
  
  islamic_compatibility STRING,             -- "Completely_Incompatible", "Partially_Incompatible", "Neutral", "Compatible"
  
  theological_severity STRING,              -- "Kufr", "Bid'ah_Kubra", "Bid'ah_Sughra", "Problematic", "Permissible"
  
  -- ═══════════════════════════════════════════════════════════════════
  -- 🏛️ 1)


-- ════════════════════════════════════════════════════════════════════
-- [097] user_settings
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.`iqraa-12.smart_notebook.user_settings` (
    user_id STRING NOT NULL,
    
    -- إعدادات التصنيف
    classification_settings STRUCT<
        default_project STRING,
        auto_classify BOOL,
        require_confirmation BOOL,
        custom_tags ARRAY<STRING>
    >,
    
    -- إعدادات التقارير
    report_settings STRUCT<
        daily_report_enabled BOOL,
        daily_report_time STRING,               -- "08:00"
        weekly_report_enabled BOOL,
        weekly_report_day STRING,               -- "friday"
        weekly_report_time STRING
    >,
    
    -- إعدادات التذكير
    reminder_settings STRUCT<
        remind_unacted_notes BOOL,
        reminder_frequency_days INT64,
        max_reminders INT64,
        quiet_hours_start STRING,               -- "22:00"
        quiet_hours_end STRING                  -- "07:00"
    >,
    
    -- إعدادات الخصوصية
    privacy_settings STRUCT<
        encrypt_content BOOL,
        auto_delete_after_days INT64,           -- 0 = never
        export_format STRING                    -- "json", "markdown"
    >,
    
    -- الاهتمامات (للراصد العلمي)
    interests STRUCT<
        keywords ARRAY<STRING>,
        authors ARRAY<STRING>,
        topics ARRAY<STRING>,
        publishers ARRAY<STRING>
    >,
    
    updated_at TIMESTAMP
);


-- ════════════════════════════════════════════════════════════════════
-- [098] waqf_and_philanthropy_network
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.waqf_and_philanthropy_network`
(
    waqf_id STRING,
    waqf_name_ar STRING,
    
    -- التأسيس
    establishment_year INT64,
    establishment_hijri STRING,
    
    -- الواقف (الممول)
    founder_info STRUCT<
        name STRING,
        gender STRING OPTIONS(description="Male, Female - لدراسة دور المرأة في الوقف"),
        social_class STRING OPTIONS(description="Sultan, Scholar, Merchant, Military"),
        political_link STRING
    >,

    -- الأصول الموقوفة
    assets_details STRUCT<
        asset_types ARRAY<STRING> OPTIONS(description="Land, Shops, Gardens, Books, Cash"),
        location_geo GEOGRAPHY,
        estimated_value_at_time STRING
    >,

    -- شروط الواقف (أخطر حقل للتحليل الفكري)
    stipulations STRUCT<
        madhab_restriction STRING OPTIONS(description="هل اشترط مذهباً معيناً للمدرسين؟"),
        beneficiary_conditions STRING,
        admin_conditions STRING OPTIONS(description="من يتولى النظارة؟"),
        curriculum_conditions STRING OPTIONS(description="هل اشترط تدريس كتب معينة؟")
    >,

    -- المصارف والمستفيدون
    beneficiaries STRUCT<
        primary_target STRING OPTIONS(description="Students, Poor, Wayfarers, Holy Cities"),
        institution_supported_id STRING OPTIONS(description="ربط بجدول المدارس أو المؤسسات")
    >
)
PARTITION BY RANGE_BUCKET(establishment_year, GENERATE_ARRAY(0, 1500, 50))
CLUSTER BY founder_info.social_class;


-- ════════════════════════════════════════════════════════════════════
-- [099] weak_hadiths_ai_retrial_core
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.weak_hadiths_ai_retrial_core`
(
  -- 🔑 المفتاح الأساسي
  hadith_id STRING NOT NULL,                 -- FK → hadith_corpus_analysis.hadith_id

  -- حقول تجميع أساسية
  traditional_weakness_type STRING NOT NULL, -- "Memory", "Unknown", "Disconnect", "Lying", ...
  ai_reassessment_status STRING NOT NULL,    -- "Upgraded", "Confirmed", "Downgraded", "Pending",

  -- 1)


-- ════════════════════════════════════════════════════════════════════
-- [100] weak_hadiths_ai_retrial_v2
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.weak_hadiths_ai_retrial_v2`
(
  -- ═══════════════════════════════════════════════════════════════════
  -- 🔑 المفتاح الأساسي
  -- ═══════════════════════════════════════════════════════════════════
  hadith_id STRING NOT NULL,                 -- FK → hadith_corpus_analysis.hadith_id

  -- ═══════════════════════════════════════════════════════════════════
  -- 📊 حقول التجميع الأساسية
  -- ═══════════════════════════════════════════════════════════════════
  traditional_weakness_type STRING NOT NULL, -- "Memory", "Unknown", "Disconnect", "Lying"
  ai_reassessment_status STRING NOT NULL,    -- "Upgraded", "Confirmed", "Downgraded", "Pending"

  -- ═══════════════════════════════════════════════════════════════════
  -- 📝 1)


-- ════════════════════════════════════════════════════════════════════
-- [101] weak_hadiths_and_revaluation
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.weak_hadiths_and_revaluation`
(
    hadith_id STRING,
    
    -- العلة التقليدية (حكم القدماء)
    traditional_verdict STRUCT<
        status STRING, -- Da'if, Munkar, Matruk
        flaw_type STRING, -- "Bad Memory", "Unknown Narrator (Majhul)", "Disconnect (Inqita)"
        critic_who_ruled STRING -- Bukhari, Daraqutni
    >,

    -- الراوي المتهم (The Weak Link)
    weak_narrator_profile STRUCT<
        narrator_id STRING,
        weakness_reason STRING, -- "Ikhtilat" (Senility), "Lying", "Heretic"
        impact_scope STRING -- هل ضعف حديثاً واحداً أم ألفاً؟
    >,

    -- الفحص الذكي (AI Re-evaluation) - "الجبروت الذكي"
    ai_retrial_results STRUCT<
        is_really_unique BOOL, -- هل تفرد فعلاً؟ (بحث في 50,000 كتاب)
        corroboration_found BOOL, -- هل وجدنا "شواهد" و"متابعات" خفية؟
        suggested_upgrade BOOL, -- هل يمكن ترقيته لـ "حسن لغيره" بناءً على البيانات الجديدة؟
        hidden_isnad_paths ARRAY<STRING> -- طرق لم يعرفها القدماء
    >,

    -- أثر الضعف
    jurisprudential_usage STRUCT<
        is_used_in_fiqh BOOL, -- هل يُعمل به في فضائل الأعمال؟
        madhhab_reliance STRING -- "Hanbalis use it", "Shafiis reject it"
    >
)
CLUSTER BY traditional_verdict.flaw_type;


-- ════════════════════════════════════════════════════════════════════
-- [102] women_in_scholarship_and_society
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.women_in_scholarship_and_society (
  woman_id STRING NOT NULL,
  birth_date DATE,
  death_date DATE,
 
  personal_info STRUCT
    name_full STRING,
    name_known_by
STRING,
   
    family_background
STRUCT
      father_name
STRING,
     father_occupation STRING,
      family_status
STRING,           --
elite/middle_class/lower_class
     
      scholarly_family
BOOLEAN,
     family_connections ARRAY<STRING>
    >
  >,
 
  -- التعليم
  education STRUCT
    literacy STRING,                  --
illiterate/basic/advanced/scholarly
   
    teachers ARRAY<STRUCT
      teacher_id
STRING,
      teacher_name
STRING,
      subjects_learned
ARRAY<STRING>,
      ijaza_received BOOLEAN
    >>,
   
    -- الإنتاج العلمي
    scholarly_output
STRUCT
      texts_authored
ARRAY<STRING>,
      students_taught
ARRAY<STRING>,
      ijazat_granted
INT64,
     
     recognition_level STRING        --
unknown/local/regional/empire_wide
    >>
  >,
 
  -- الأوقاف النسائية
  waqf_activity STRUCT
    established_awqaf
ARRAY<STRING>,  -- FK →
waqf_and_philanthropy_network
   
    waqf_motivations
ARRAY<STRING>,
   
    total_waqf_value
FLOAT64
  >,
 
  -- الدور الاجتماعي
  social_role STRUCT
    roles ARRAY<STRING>,              --
scholar/patron/merchant/poet/mystic
   
    social_influence
STRING,
   
    networks ARRAY<STRUCT
      network_type
STRING,            --
scholarly/political/commercial/family
      key_connections
ARRAY<STRING>
    >>
  >,
 
  -- القيود والتحديات
  constraints_faced
STRUCT
    legal_constraints
ARRAY<STRING>,
    social_constraints
ARRAY<STRING>,
   economic_constraints ARRAY<STRING>,
   
    -- كيف تجاوزتها؟
    coping_strategies
ARRAY<STRING>
  >,
 
  related_entities
STRUCT
    related_scholars
ARRAY<STRING>,
    related_rulers
ARRAY<STRING>,
   related_institutions ARRAY<STRING>,
    related_texts
ARRAY<STRING>
  >
)
PARTITION BY death_date
CLUSTER BY education.scholarly_output.recognition_level;


-- ════════════════════════════════════════════════════════════════════
-- [103] women_scholars_and_intellectuals
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `iqraa-12.iqraa_12_dataset.women_scholars_and_intellectuals (
  scholar_id STRING NOT NULL,           -- FK → author_profiles_master
  
  -- المجال
  fields_of_expertise ARRAY<STRING>,    -- hadith/fiqh/sufism/literature/calligraphy
  
  -- التعليم
  education_path STRUCT<
    teachers ARRAY<STRING>,
    ijazas_received ARRAY<STRING>,
    learning_environment STRING         -- home/local_sheikh/public_lectures
  >,
  
  -- الإنتاج والتأثير
  contributions STRUCT<
    students_taught ARRAY<STRING>,      -- notable male and female students
    texts_authored ARRAY<STRING>,
    narrations_transmitted INT64,       -- for hadith scholars
    fatwas_issued BOOLEAN
  >,
  
  -- الدور الاجتماعي-المعرفي
  social_role STRUCT<
    patronage_activities ARRAY<STRING>, -- awqaf/sponsorship
    literary_salons_hosted BOOLEAN,
    public_authority STRING             -- muhtasiba/advisor
  >,
  
  -- التحديات
  challenges_faced ARRAY<STRING>,       -- social_barriers/access_restrictions
  
  metadata STRUCT<
    biographical_sources ARRAY<STRING>
  >
)
CLUSTER BY fields_of_expertise;
