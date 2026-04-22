Evaluate the following task for goal alignment (impact) and client visibility.

## Task
- **Title**: {{ task_title }}
- **Description**: {{ task_description | default("(no description)") }}

{% if goal_title %}
## Goal
- **Title**: {{ goal_title }}
- **Description**: {{ goal_description | default("(no description)") }}
- **Tier**: {{ goal_tier | default("unset") }}
{% else %}
## Goal
No goal linked to this task.
{% endif %}

{% if client_name %}
## Client
- **Name**: {{ client_name }}
- **Revenue Range**: {{ client_revenue | default("unknown") }}
- **Relationship State**: {{ client_relationship | default("unknown") }}
- **Disposition**: {{ client_disposition | default("unknown") }}
{% else %}
## Client
No client linked to this task.
{% endif %}

Today's date: {{ current_date }}