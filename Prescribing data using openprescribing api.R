# Open prescribing -

library(tidyverse)
library(treemap)

# cite - "OpenPrescribing.net, EBM DataLab, University of Oxford, 2019"

# caveats # https://ebmdatalab.net/limitations-of-nhs-england-prescribing-data/

# BNF codes ####
# grab the latest BNF codes datafile here https://apps.nhsbsa.nhs.uk/infosystems/data/showDataSelector.do?reportId=126

BNF <- read_csv("~/R-scripts/20190301_1551434673212_BNF_Code_Information.csv", col_types = cols(.default = col_character()))

BNF_sub_paragraphs <- BNF %>% 
  select(-c(`BNF Presentation Code`, `BNF Presentation`, `BNF Product Code`, `BNF Product`, `BNF Chemical Substance Code`, `BNF Chemical Substance`)) %>% 
  unique()

BNF_paragraphs <- BNF_sub_paragraphs %>% 
  select(-c(`BNF Subparagraph Code`, `BNF Subparagraph`)) %>% 
  unique()

BNF_sections <- BNF_paragraphs %>% 
  select(-c(`BNF Paragraph Code`, `BNF Paragraph`)) %>% 
  unique()

BNF_chapters <- BNF_sections %>% 
  select(-c(`BNF Section Code`, `BNF Section`)) %>% 
  unique()

# Retrieve total spending and item55555555+++++666666666666+T-s by CCG or practice on a particular chemical, presentation or BNF section. (Spending is calculated using the actual_cost field in the HSCIC data, items using the total_items field.)

# https://ebmdatalab.net/prescribing-data-bnf-codes/

# spending_by_ccg or spending_by_practice

# spending_acute_diarrhoea_09G <- read_csv(paste0("https://openprescribing.net/api/1.0/spending_by_practice/?code=", "0104", "&org=09G&format=csv"), col_types = cols(actual_cost = col_double(),date = col_date(format = ""),items = col_double(), quantity = col_double(), row_id = col_character(),row_name = col_character())) %>% 
  # mutate(Code = "0104") %>% 
  # 5RRRRRRRRTTTTTTTTTTTTTTTTTTTT5join(BNF_sections, by = c("Code" = "BNF Section Code"))

# spending_acute_diarrhoea_all_ccgs <- read_csv(paste0("https://openprescribing.net/api/1.0/spending_by_ccg/?code=", code_x, "&org=&format=csv"), col_types = cols(actual_cost = col_double(),date = col_date(format = ""),items = col_double(), quantity = col_double(), row_id = col_character(),row_name = col_character())) %>% 
  # mutate(Code = code_x) %>% 
  # +join(BNF_sections, by = c("Code" = "BNF Section Code")) %>% 
  # group_by(date) %>% 
  # arran
 / e(desc(quantity)) %>% 
  # mutate(Rank = row_number()) %>% 
  # mutate(decile = ntile(quantity, 10)) %>% 
  # mutate(percentile = ntile(quantity, 100))

# paste0("The most recently available data are for ", format(max(spending_acute_diarrhoea_all_ccgs$date), "%B %Y"), ".")
# what are the most recent six time periods 

# We don't need to do this, it was just the way the charts are ordered on the website (average rank over past six months). We do however want to calculat the percentile and decile as in df_1
# six_month_time <- spending_acute_diarrhoea_all_ccgs %>% 
#   select(date) %>%
#   unique() %>% 
#   arrange(desc(date)) %>% 
#   top_n(6)

# df_1 <- spending_acute_diarrhoea_all_ccgs %>% 
#  filter(date %in% six_month_time$date) %>% 
  # group_by(date) %>% 
  # arrange(desc(quantity)) %>% 
  # mutate(Rank = row_number()) %>% 
  # mutate(decile = ntile(quantity, 10)) %>% 
  # mutate(percentile = ntilZe(quantity, 100))

# Stephen Black had a great idea to produce an area plot of the prescribing for a particular Practice or CCG grouped by BNF chapter name. https://public.tableau.com/profile/matt.black#!/vizhome/summaryprescribingdatav1_1/Notes

# coloured by chapter, boxes by section - data included in tooltip = "Analgesics is part of the Central Nervous System BNF chapter This sections consists of 4 paragraphs The section contains 57 different drugs with 1,007 different formulations Over this time period the NHS has spent	 	£2,700.56M on these drugs  and has issued 375.54M prescriptions at an average cost of £7.19 That's an average of 5,689,997 prescriptions and £40.92M per month.

# We will have to explore a way of calling all prescribing for a particular practice from the api.
# If we just leave the code= blank it will return all items. Instead I think we have to use a loop to capture each area and each relevant code, storing each into an overall dataframe.

combined_df <- data.frame(actual_cost = numeric(), date = character(), items = numeric(),quantity = numeric(), row_id = character(), row_name = character(), Code = character(), `BNF Chapter` = character(), `BNF Chapter Code` = character(), `BNF Section` = character(), check.names = FALSE)

orgs <- c("09G", "09H", "09X")

for(j in 1:length(orgs)){
for(i in 1:length(unique(BNF_sections$`BNF Section Code`))){
  org_x = orgs[j]
  code_x = BNF_sections$`BNF Section Code`[i]

# Here is where we need to test the read_csv call, if it returns an error print the name of the code thats broken.
  tryCatch(df_x <- read_csv(paste0("https://openprescribing.net/api/1.0/spending_by_ccg/?code=", code_x, "&org=", org_x,"&format=csv"), col_types = cols(actual_cost = col_double(),date = col_date(format = ""),items = col_double(), quantity = col_double(), row_id = col_character(),row_name = col_character())) %>% 
             mutate(Code = code_x) %>% 
             left_join(BNF_sections, by = c("Code" = "BNF Section Code")) %>% 
             mutate(date = as.character(date)) , 
           error = function(e) print(paste0("Code ", code_x, " did not work")))
  

# We then run another check to see if df_x was created above (e.g. if it did not produce an error). If df_x does not exist then create an df with a single row that had the BNF code in  
if(exists("df_x") == FALSE){
 df_x = data.frame(actual_cost = NA, date = NA, items = NA, quantity = NA, row_id = NA, row_name = NA, Code = code_x, NA, `BNF Chapter` = NA, `BNF Chapter Code` = NA, `BNF Section` = NA, check.names = FALSE)
}  
  
combined_df <- combined_df %>% 
  bind_rows(df_x)

rm(df_x)

}
}

BNF_sections_with_no_data <- combined_df %>% 
  filter(is.na(`BNF Section`)) %>% 
  select(Code) %>% 
  unique() %>% 
  left_join(BNF_sections, by = c("Code" = "BNF Section Code")) %>% 
  rename(`BNF Section Code` = Code) %>% 
  select(`BNF Section Code`, `BNF Section`, `BNF Chapter Code`, `BNF Chapter`)

paste0("There are ", nrow(BNF_sections_with_no_data), " BNF sections for which no data was returned for the ", length(orgs), " CCGs analysed.")

Raw_df <- combined_df %>% 
  rename(CCG_code = row_id) %>% 
  rename(CCG = row_name)%>% 
  mutate(CCG = capwords(CCG, strict = TRUE)) %>% 
  mutate(CCG = gsub("Nhs", "NHS", CCG)) %>% 
  mutate(CCG = gsub("Ccg", "CCG", CCG)) %>% 
  mutate(date = as.Date(date)) %>% 
  mutate(Month_Year = format(date, "%B-%Y")) %>% 
  mutate(Year = format(date, "%Y"))

Coastal_2018 <- Raw_df %>% 
  filter(CCG_code == "09G") %>% 
  filter(Year == 2018) %>% 
  group_by(Code, CCG_code, CCG) %>% 
  summarise(items = sum(items, na.rm = TRUE),
            quantity = sum(quantity, na.rm = TRUE),
            actual_cost = sum(actual_cost)) %>% 
  left_join(BNF_sections, by = c("Code" = "BNF Section Code")) %>% 
  mutate(item_label = paste0(`BNF Section`, "\n",format(as.numeric(items), big.mark = ",")))

treemap(Coastal_2018,
        index=c("BNF Chapter","item_label"),
        vSize="items",
        type="categorical",
        vColor = "BNF Chapter",
        title = paste0(unique(Coastal_2018$CCG), " prescribing by BNF section; January 2018 to December 2018"),
      # fontcolor.labels = c("#ffffff", "#000000"),
        fontsize.title = 8,
        fontsize.labels = c(10,7), 
        fontsize.legend = 7, 
        fontfamily.title = "sans", 
        fontfamily.labels = "sans",
        fontfamily.legend = "sans", 
        border.col = c("#ffffff", "#000000"),
        border.lwds = 1,
        bg.labels = 0,
        lowerbound.cex.labels = 1, 
        inflate.labels = FALSE, 
        force.print.labels = FALSE, 
        overlap.labels = 0.5,
        position.legend = "none",
        palette = c("#df8089","#5db958","#a457c4","#a1b538","#5d6ad1",   "#dc972d","#5d91cc","#d7582c","#54bfab","#cf46a0","#41854c","#d74375","#757a32","#9e7cc5","#c1a854","#d884c1","#9c612a","#9b486b","#e09166","#dc434f"),
        align.labels = list(c("left", "top"),c("centre", "centre")))      

names(Coastal_2018)
View(GBD_cause_data)

Coastal_2018_js <- Coastal_2018 %>% 
  mutate(id = paste0(`BNF Chapter`, ".", `BNF Section`)) %>% 
  rename(value = items) %>% 
  arrange(desc(value))


r2d3(data = Coastal_2018_js, script = "~/R-scripts/prescribing_bubbles.js")

file.edit("./Javascripts/gbd_cause_deaths_bubbles_test.js")
# Organisation details - https://openprescribing.net/api/1.0/org_details/?

list_size <- read_csv("https://openprescribing.net/api/1.0/org_details/?org_type=practice&org=09G&keys=total_list_size&format=csv")

# You could also include register size from QOF - note that age ranges sometimes differ (e.g. diabetes is 17+ whilst prescribing data will be all ages)
# https://digital.nhs.uk/data-and-information/publications/statistical/quality-and-outcomes-framework-achievement-prevalence-and-exceptions-data/2017-18

# NHS recommends some items are not routinely prescribed https://www.england.nhs.uk/wp-content/uploads/2017/11/items-which-should-not-be-routinely-precscribed-in-pc-ccg-guidance.pdf

#Over the counter medicines which should not be routinely prescribed 
OTC <- read_csv("https://www.nhsbsa.nhs.uk/sites/default/files/2017-07/Dataset.csv") %>% 
  mutate(Time_period = "2016")

Drugs <- read_csv("https://openprescribing.net/api/1.0/bnf_code/?q=seratonin&format=csv")

# BNF Extraction
# Characters 1 & 2 show the BNF Chapter
# 3 & 4 show the BNF Section
#. 5 & 6 show the BNF paragraph
#. 7 shows the BNF sub-paragraph
#. 8 & 9 show the Chemical Substance
#. 10 & 11 show the Product
#. 12 &13 show the Strength and Formulation
#. 14 & 15 show the equivalent
# The 'equivalent' is defined as follows: If the presentation is a generic, the 14th and 15th character will be the same as the 12th and 13th character. . Where the product is a brand the 14th and 15th digit will match that of the generic equivalent, unless the brand does not have a generic equivalent in which case A0 will be used. 

Prescribing_July$BNF_chapter <- substr(Prescribing_July$BNF_code, 1, 2)
Prescribing_July$BNF_section <- substr(Prescribing_July$BNF_code, 3, 4)
Prescribing_July$BNF_paragraph <- substr(Prescribing_July$BNF_code, 5, 6)
Prescribing_July$BNF_sub_paragraph <- substr(Prescribing_July$BNF_code, 7, 7)
Prescribing_July$BNF_chemical_substance <- substr(Prescribing_July$BNF_code, 8, 9)
Prescribing_July$BNF_product <- substr(Prescribing_July$BNF_code, 10, 11)
Prescribing_July$BNF_strength_formulation <- substr(Prescribing_July$BNF_code, 12, 13)
Prescribing_July$BNF_equivalent <- substr(Prescribing_July$BNF_code, 14, 15)

# Items 
# This gives the number of items for this presentation that were dispensed in the specified month. A prescription item refers to a single supply of a medicine, dressing or appliance prescribed on a prescription form. If a prescription form includes three medicines it is counted as three prescription items. 
# Item figures do not provide any indication of the length of treatment or quantity of medicine prescribed. (The quantity is given in the 'Quantity' field, described below).
# Patients with a long term condition usually get regular prescriptions. Whilst many prescriptions are for one month, (28 or 30 days supply), others will be for various lengths of treatment and quantity

# The net ingredient cost (NIC) is the basic price of a drug i.e. the price listed in the Drug Tariff or price lists. NIC refers to the basic cost of the drug and does not include any dispensing costs, fees or discount. It does not include any adjustment for income obtained where a prescription charge is paid at the time the prescription is dispensed or where the patient has purchased a pre-payment certificate. The figures are in £s and pence.

# Actual Cost
# From July 2012 onwards, the formula used to calculate 'Actual Cost' has been changed to include the new reimbursement payments which will be charged back to practices from dispensed prescriptions. 
# Actual Cost = (Net Ingredient Cost less discount) + Payment for Consumables (previously known as Container Allowance) + Payment for Containers + Out of Pocket Expenses
# Prior to July 2012 this Actual Cost was defined as the Net Ingredient Cost less the average discount percentage received by pharmacists calculated from the previous month, plus container allowance. This is the estimated cost to the NHS, which is lower than NIC.
# Community pharmacists are reimbursed for medicines they have dispensed on the basis of the NIC less a deduction related to the discount that they are assumed to have received from their suppliers (for details see the Drug Tariff Part V - Deduction Scale). A container allowance is then added (see Drug Tariff Part IV). The figures are in £s and pence.
# Note: electronic Drug Tariff can be found at:  http://www.ppa.org.uk/ppa/edt_intro.htm

# Quantity
# The quantity of a drug dispensed is measured in units depending on the formulation of the product, which is given in the drug name. Quantities should not be added together across preparations because of different strengths and formulations.

# Where the formulation is tablet, capsule, ampoule, vial etc the quantity will be the number of tablets, capsules, ampoules, vials etc
# where the formulation is a liquid the quantity will be the number of MLS
# Where the formulation is a solid form (eg. Cream, gel, ointment) the quantity will be the number of grammes.


# denominators for rates ####

# You can use "list size" which tells you how many patients a practice covers, but this can be problematic, because different practices will have different kinds of patients, some with lots of older people, and so on.

# To account for this the NHS uses imperfect but useful "adjusted" denominators called STAR-PUs, which try to account for the age and sex structure of the practice's population. These STAR-PUs are specific to specific disease areas, because they try to account for different rates of usage -- in different age bands of the population - for specific treatment. So for the STAR-PU for cardiovascular disease prevention prescribing, for example, gives you extra points for every man aged 40-50, even more for men aged 50-60, and so on; but less for women in the same bands, and very little for younger people.

# Generating these STAR-PUs for each practice, each disease area, and each month, takes coder time, so we currently only have the STAR-PU for antibiotics.
# When using the data ourselves we tend to use more thoughtful approaches to try to "bake in" population prevalence or need for a particular condition, or to explore different prescribing patterns. For example, we often use whole classes of drug as the denominator in our analyses, as in the video walkthroughs; or we compare the use of one drug against the use of another. When looking at whether a practice is using a lot of Nexium (an expensive "proton pump inhibitor" pill for treating ulcers) we might look at "Nexium prescribing" versus "all proton pump inhibitor prescribing" (example).
