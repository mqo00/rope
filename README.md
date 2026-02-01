# What Should We Engineer in Prompts? Training Humans in Requirement-Driven LLM Use [(Paper)](https://dl.acm.org/doi/10.1145/3731756) [(Arxiv)](https://arxiv.org/abs/2409.08775)

TOCHI 2025. Media Coverage: [SCS News](https://www.cs.cmu.edu/news/2025/prompt-training), [New York Times](https://www.nytimes.com/2025/11/12/opinion/ai-coding-computer-science.html?unlocked_article_code=1.0k8.XC9Y.whTHY-2Ecg9i&smid=url-share)

![ROPE Training and Assessment Illustration](study_material/image.png)

- (A) Our ROPE training help learners write effective prompt programs by providing deliberate practice in adding and clarifying requirements, with various automated feedback. 
- (B) We assess learners' prompt quality on both requirement quality and LLM output quality in a pre-post randomized experimental design. 
- (C) In pre-post assessments, learners write prompt programs to create customized LLM applications (e.g. Trip Advisor in D through a prompt in E).
- We observe that ROPE training significantly improves novices' prompt quality, compared to traditional prompt engineering training. 


**Content Directory**
```
├── README.md
├── study_material
│   ├── reference_reqs_prompts.pdf
│   └── user_study_prompts.csv
└── system
    ├── README.md
    ├── prompts.md
    └── ...
```

## study_material: 
`reference_reqs_prompts.pdf`: 
- pre-post test task descriptions, requirement rubrics, and ground-truths
- prompts for LLM output generation for grading
- prompts for optimizer (Prompt Maker) 

`user_study_prompts.csv`: prompts that users wrote during the pre-post test.

## system:
`README.md`: instructions for setting up the system and adding new tasks. 

`prompts.md`: prompts used in the system to generate chat-based feedback, requirement document updates, and code counterfactuals.

Video Demo for the training system: https://youtu.be/oJq2DYvw8l0

## Citation:
Ma, Q., Peng, W., Yang, C., Shen, H., Koedinger, K., & Wu, T. (2025). What should we engineer in prompts? training humans in requirement-driven llm use. ACM Transactions on Computer-Human Interaction, 32(4), 1-27. [https://dl.acm.org/doi/10.1145/3731756](https://dl.acm.org/doi/10.1145/3731756)
```
@article{ma2025rope,
author = {Ma, Qianou and Peng, Weirui and Yang, Chenyang and Shen, Hua and Koedinger, Ken and Wu, Tongshuang},
title = {What Should We Engineer in Prompts? Training Humans in Requirement-Driven LLM Use},
year = {2025},
issue_date = {August 2025},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
volume = {32},
number = {4},
issn = {1073-0516},
url = {https://doi.org/10.1145/3731756},
doi = {10.1145/3731756},
journal = {ACM Trans. Comput.-Hum. Interact.},
month = aug,
articleno = {41},
numpages = {27},
keywords = {LLM, Human-AI Interaction, Prompt Engineering, Requirement Engineering, End-User Programming}
}
```
